package com.tarea4web.tarea4web.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "miembro")
public class Miembro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String nombre;

    @NotNull
    private String apellido;

    @NotNull
    private String email;

    @NotNull
    private String password;

    @NotNull
    @Column(name = "comuna_id")
    private Long comunaId;

    public Miembro() {
    }

    public Miembro(String nombre, String apellido, String email, String password, Long comunaId) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.password = password;
        this.comunaId = comunaId;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public Long getComunaId() {
        return comunaId;
    }
}
