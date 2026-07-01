package com.tarea4web.tarea4web.models;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "actividad")
public class Actividad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "miembro_id")
    private Long miembroId;

    @NotNull
    private String nombre;

    private String descripcion;

    @NotNull
    private LocalDate fecha;

    @NotNull
    private String tipo;

    public Actividad() {
    }

    public Actividad(Long miembroId, String nombre, String descripcion, LocalDate fecha, String tipo) {
        this.miembroId = miembroId;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.tipo = tipo;
    }

    public Long getId() {
        return id;
    }

    public Long getMiembroId() {
        return miembroId;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public String getTipo() {
        return tipo;
    }
}
