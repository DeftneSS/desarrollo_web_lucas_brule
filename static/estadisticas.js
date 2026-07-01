

async function fetchJSON(url) {
    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Error: network response was not ok");
        }

        const datos = await res.json();
        return datos;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

async function cargarMiembrosPorDia() {
    const url = "/api/estadisticas/miembros-por-dia";
    try {
        const datos = await fetchJSON(url);
        const puntos = datos.map(function (d) {
            const partes = d.dia.split("-").map(Number);
            return [Date.UTC(partes[0], partes[1] - 1, partes[2]), d.total];
        });

        Highcharts.chart("grafico-miembros-por-dia", {
            chart: {
                type: "line"
            },
            title: {
                text: "Miembros registrados por día"
            },
            xAxis: {
                type: "datetime",
                title: {
                    text: "Día"
                }
            },
            yAxis: {
                title: {
                    text: "Cantidad de miembros"
                },
                allowDecimals: false,
                min: 0
            },
            tooltip: {
                xDateFormat: "%d/%m/%Y",
                shared: true
            },
            series: [{
                name: "Miembros",
                data: puntos,
                color: "#007bff"
            }],
            legend: {
                enabled: true
            },
            credits: {
                enabled: false
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: "horizontal",
                            align: "center",
                            verticalAlign: "bottom"
                        }
                    }
                }]
            }
        });
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

async function cargarActividadesPorTipo() {
    const url = "/api/estadisticas/actividades-por-tipo";
    try {
        const datos = await fetchJSON(url);
        const puntos = datos.map(function (d) { return { name: d.tipo, y: d.total }; });

        Highcharts.chart("grafico-actividades-por-tipo", {
            chart: {
                type: "pie"
            },
            title: {
                text: "Actividades extraprogramáticas por tipo"
            },
            tooltip: {
                pointFormat: "<b>{point.y}</b> actividades ({point.percentage:.1f}%)"
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: true,
                        format: "{point.name}: {point.y}"
                    }
                }
            },
            series: [{
                name: "Actividades",
                data: puntos
            }],
            legend: {
                enabled: true
            },
            credits: {
                enabled: false
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: "horizontal",
                            align: "center",
                            verticalAlign: "bottom"
                        }
                    }
                }]
            }
        });
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

async function cargarActividadesPorComuna() {
    const url = "/api/estadisticas/actividades-por-comuna";
    try {
        const datos = await fetchJSON(url);
        const categorias = datos.map(function (d) { return d.comuna; });
        const valores = datos.map(function (d) { return d.total; });

        Highcharts.chart("grafico-actividades-por-comuna", {
            chart: {
                type: "column"
            },
            title: {
                text: "Actividades registradas por comuna"
            },
            xAxis: {
                categories: categorias,
                title: {
                    text: "Comuna"
                }
            },
            yAxis: {
                title: {
                    text: "Total de actividades"
                },
                allowDecimals: false,
                min: 0
            },
            tooltip: {
                pointFormat: "<b>{point.y}</b> actividades"
            },
            series: [{
                name: "Actividades",
                data: valores,
                color: "#28a745"
            }],
            legend: {
                enabled: true
            },
            credits: {
                enabled: false
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: "horizontal",
                            align: "center",
                            verticalAlign: "bottom"
                        }
                    }
                }]
            }
        });
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

async function cargarTodosLosGraficos() {
    try {
        await Promise.all([
            cargarMiembrosPorDia(),
            cargarActividadesPorTipo(),
            cargarActividadesPorComuna(),
        ]);
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

document.addEventListener("DOMContentLoaded", cargarTodosLosGraficos);
