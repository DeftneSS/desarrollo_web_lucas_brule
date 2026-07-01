package com.tarea4web.tarea4web.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "nota")
public class Nota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "actividad_id")
    private Long actividadId;

    @NotNull
    @Min(1)
    @Max(7)
    private Integer nota;

    public Nota() {
    }

    public Nota(Long actividadId, Integer nota) {
        this.actividadId = actividadId;
        this.nota = nota;
    }

    public Long getId() {
        return id;
    }

    public Long getActividadId() {
        return actividadId;
    }

    public Integer getNota() {
        return nota;
    }

    public void setActividadId(Long actividadId) {
        this.actividadId = actividadId;
    }

    public void setNota(Integer nota) {
        this.nota = nota;
    }
}
