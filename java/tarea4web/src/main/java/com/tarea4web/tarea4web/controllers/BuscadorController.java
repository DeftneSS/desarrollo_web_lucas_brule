package com.tarea4web.tarea4web.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

import com.tarea4web.tarea4web.models.Miembro;
import com.tarea4web.tarea4web.services.BuscadorService;

import jakarta.servlet.http.HttpSession;

@Controller
public class BuscadorController {

    private final BuscadorService buscadorService;

    public BuscadorController(BuscadorService buscadorService) {
        this.buscadorService = buscadorService;
    }

    @GetMapping("/")
    public String index(HttpSession session, Model model) {
        Miembro miembro = (Miembro) session.getAttribute("miembro");
        if (miembro != null) {
            model.addAttribute("miembro", miembro);
        }
        return "buscador";
    }

    @GetMapping("/login")
    public String loginPage(HttpSession session, Model model) {
        if (session.getAttribute("miembro") != null) {
            return "redirect:/";
        }
        return "login";
    }

    @PostMapping("/login")
    public String login(@RequestParam("email") String email,
                        @RequestParam("password") String password,
                        HttpSession session, Model model) {
        Optional<Miembro> miembro = buscadorService.autenticar(email, password);
        if (miembro.isEmpty()) {
            model.addAttribute("error", "Email o contraseña incorrectos.");
            model.addAttribute("email", email);
            return "login";
        }
        session.setAttribute("miembro", miembro.get());
        session.setAttribute("misNotas", new HashMap<Long, Long>());
        return "redirect:/";
    }

    @GetMapping("/logout")
    public RedirectView logout(HttpSession session) {
        session.invalidate();
        return new RedirectView("/");
    }

    @GetMapping("/api/actividades/buscar")
    @ResponseBody
    public List<Map<String, String>> buscar(@RequestParam("q") String q, HttpSession session) {
        if (q == null || q.trim().length() < 3) {
            return List.of();
        }
        List<Map<String, String>> resultados = buscadorService.buscarActividades(q.trim());
        marcarYaEvaluadas(resultados, session);
        return resultados;
    }

    @GetMapping("/api/actividades")
    @ResponseBody
    public List<Map<String, String>> listarTodas(HttpSession session) {
        List<Map<String, String>> resultados = buscadorService.listarTodas();
        marcarYaEvaluadas(resultados, session);
        return resultados;
    }

    @PostMapping("/api/actividades/{id}/notas")
    @ResponseBody
    public ResponseEntity<Map<String, String>> agregarNota(
            @PathVariable("id") Long actividadId,
            @RequestBody Map<String, Object> body,
            HttpSession session) {

        Miembro miembro = (Miembro) session.getAttribute("miembro");
        if (miembro == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Debes iniciar sesión para evaluar."));
        }

        Map<Long, Long> misNotas = getMisNotas(session);
        if (misNotas.containsKey(actividadId)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Ya evaluaste esta actividad."));
        }

        Integer nota = parseNota(body.get("nota"));

        Map<String, String> resultado = buscadorService.agregarNota(actividadId, nota);
        if (resultado.containsKey("error")) {
            return ResponseEntity.badRequest().body(resultado);
        }

        String notaIdStr = resultado.remove("nota_id");
        if (notaIdStr != null) {
            misNotas.put(actividadId, Long.parseLong(notaIdStr));
        }
        return ResponseEntity.ok(resultado);
    }

    @DeleteMapping("/api/actividades/{id}/notas")
    @ResponseBody
    public ResponseEntity<Map<String, String>> eliminarNota(
            @PathVariable("id") Long actividadId,
            HttpSession session) {

        Miembro miembro = (Miembro) session.getAttribute("miembro");
        if (miembro == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Debes iniciar sesión para retirar tu evaluación."));
        }

        Map<Long, Long> misNotas = getMisNotas(session);
        Long notaId = misNotas.get(actividadId);
        if (notaId == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "No has evaluado esta actividad en esta sesión."));
        }

        Map<String, String> resultado = buscadorService.eliminarNota(notaId, actividadId);
        if (resultado.containsKey("error")) {
            return ResponseEntity.badRequest().body(resultado);
        }

        misNotas.remove(actividadId);
        return ResponseEntity.ok(resultado);
    }

    private Integer parseNota(Object valor) {
        if (valor instanceof Number) {
            return ((Number) valor).intValue();
        }
        if (valor instanceof String) {
            try {
                return Integer.parseInt((String) valor);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<Long, Long> getMisNotas(HttpSession session) {
        Object valor = session.getAttribute("misNotas");
        if (valor instanceof Map) {
            return (Map<Long, Long>) valor;
        }
        Map<Long, Long> nuevo = new HashMap<>();
        session.setAttribute("misNotas", nuevo);
        return nuevo;
    }

    private void marcarYaEvaluadas(List<Map<String, String>> resultados, HttpSession session) {
        Miembro miembro = (Miembro) session.getAttribute("miembro");
        if (miembro == null) {
            for (Map<String, String> r : resultados) {
                r.put("ya_evaluada", "false");
            }
            return;
        }
        Map<Long, Long> misNotas = getMisNotas(session);
        List<Map<String, String>> lista = new ArrayList<>(resultados);
        for (Map<String, String> r : lista) {
            Long id = Long.parseLong(r.get("id"));
            r.put("ya_evaluada", misNotas.containsKey(id) ? "true" : "false");
        }
    }
}
