package com.tarea4web.tarea4web.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.tarea4web.tarea4web.models.Actividad;
import com.tarea4web.tarea4web.models.ActividadRepository;
import com.tarea4web.tarea4web.models.Comuna;
import com.tarea4web.tarea4web.models.ComunaRepository;
import com.tarea4web.tarea4web.models.Miembro;
import com.tarea4web.tarea4web.models.MiembroRepository;
import com.tarea4web.tarea4web.models.Nota;
import com.tarea4web.tarea4web.models.NotaRepository;

@Service
public class BuscadorService {

    private final ActividadRepository actividadRepository;
    private final MiembroRepository miembroRepository;
    private final ComunaRepository comunaRepository;
    private final NotaRepository notaRepository;

    public BuscadorService(ActividadRepository actividadRepository,
                           MiembroRepository miembroRepository,
                           ComunaRepository comunaRepository,
                           NotaRepository notaRepository) {
        this.actividadRepository = actividadRepository;
        this.miembroRepository = miembroRepository;
        this.comunaRepository = comunaRepository;
        this.notaRepository = notaRepository;
    }

    public Optional<Miembro> autenticar(String email, String password) {
        Optional<Miembro> miembro = miembroRepository.findByEmail(email);
        if (miembro.isPresent() && miembro.get().getPassword().equals(password)) {
            return miembro;
        }
        return Optional.empty();
    }

    public List<Map<String, String>> buscarActividades(String query) {
        List<Actividad> actividades = actividadRepository.findAll();
        List<Map<String, String>> resultados = new ArrayList<>();

        String qLower = query.toLowerCase();

        for (Actividad act : actividades) {
            Miembro miembro = miembroRepository.findById(act.getMiembroId()).orElse(null);
            if (miembro == null) continue;

            Comuna comuna = comunaRepository.findById(miembro.getComunaId()).orElse(null);
            if (comuna == null) continue;

            String nombreAct = act.getNombre() != null ? act.getNombre() : "";
            String descAct = act.getDescripcion() != null ? act.getDescripcion() : "";
            String nombreComuna = comuna.getNombre() != null ? comuna.getNombre() : "";

            boolean coincide = nombreAct.toLowerCase().contains(qLower)
                    || descAct.toLowerCase().contains(qLower)
                    || nombreComuna.toLowerCase().contains(qLower);

            if (coincide) {
                Map<String, String> data = new HashMap<>();
                data.put("id", act.getId().toString());
                data.put("nombre", nombreAct);
                data.put("descripcion", descAct);
                data.put("fecha", act.getFecha() != null ? act.getFecha().toString() : "");
                data.put("tipo", act.getTipo() != null ? act.getTipo() : "");
                data.put("miembro", miembro.getNombre() + " " + miembro.getApellido());
                data.put("comuna", nombreComuna);

                Map<String, String> notaInfo = calcularNota(act.getId());
                data.put("nota", notaInfo.get("nota"));
                data.put("cantidad_notas", notaInfo.get("cantidad_notas"));

                resultados.add(data);
            }
        }
        return resultados;
    }

    public List<Map<String, String>> listarTodas() {
        List<Actividad> actividades = actividadRepository.findAll();
        List<Map<String, String>> resultados = new ArrayList<>();

        for (Actividad act : actividades) {
            Miembro miembro = miembroRepository.findById(act.getMiembroId()).orElse(null);
            if (miembro == null) continue;

            Comuna comuna = comunaRepository.findById(miembro.getComunaId()).orElse(null);
            if (comuna == null) continue;

            Map<String, String> data = new HashMap<>();
            data.put("id", act.getId().toString());
            data.put("nombre", act.getNombre() != null ? act.getNombre() : "");
            data.put("fecha", act.getFecha() != null ? act.getFecha().toString() : "");
            data.put("tipo", act.getTipo() != null ? act.getTipo() : "");
            data.put("miembro", miembro.getNombre() + " " + miembro.getApellido());
            data.put("comuna", comuna.getNombre() != null ? comuna.getNombre() : "");

            Map<String, String> notaInfo = calcularNota(act.getId());
            data.put("nota", notaInfo.get("nota"));
            data.put("cantidad_notas", notaInfo.get("cantidad_notas"));

            resultados.add(data);
        }
        return resultados;
    }

    public Map<String, String> agregarNota(Long actividadId, Integer nota) {
        Map<String, String> respuesta = new HashMap<>();

        if (nota == null || nota < 1 || nota > 7) {
            respuesta.put("error", "La nota debe ser un entero entre 1 y 7.");
            return respuesta;
        }

        if (!actividadRepository.existsById(actividadId)) {
            respuesta.put("error", "La actividad no existe.");
            return respuesta;
        }

        Nota nueva = new Nota(actividadId, nota);
        Nota guardada = notaRepository.save(nueva);

        Map<String, String> resultado = calcularNota(actividadId);
        resultado.put("nota_id", guardada.getId().toString());
        return resultado;
    }

    public Map<String, String> eliminarNota(Long notaId, Long actividadId) {
        Map<String, String> respuesta = new HashMap<>();

        if (!notaRepository.existsById(notaId)) {
            respuesta.put("error", "La nota no existe.");
            return respuesta;
        }

        notaRepository.deleteById(notaId);
        return calcularNota(actividadId);
    }

    private Map<String, String> calcularNota(Long actividadId) {
        List<Nota> notas = notaRepository.findByActividadId(actividadId);
        Map<String, String> info = new HashMap<>();

        if (notas.isEmpty()) {
            info.put("nota", "-");
            info.put("cantidad_notas", "0");
            return info;
        }

        int suma = 0;
        for (Nota n : notas) {
            suma += n.getNota();
        }
        double promedio = (double) suma / notas.size();
        info.put("nota", String.format("%.1f", promedio));
        info.put("cantidad_notas", String.valueOf(notas.size()));
        return info;
    }
}
