# Métrica de Complejidad Ciclomática de McCabe
## TechStore Smart Commerce S.A. — Sistema de Información Gerencial

## Metodología

Se aplicó la métrica de complejidad ciclomática de McCabe (1976) sobre la totalidad
del backend desarrollado en Go, utilizando la herramienta `gocyclo`
(https://github.com/fzipp/gocyclo), que calcula automáticamente el valor
M = E − N + 2P para cada función del código fuente.

Escala de riesgo aplicada según McCabe:
- 1–10:  Complejidad baja — código simple, fácilmente testeable
- 11–20: Complejidad moderada — requiere atención
- 21–50: Complejidad alta — riesgo elevado, candidato a refactorización
- 50+:   Código no testeable — refactorización obligatoria

## Resultados generales

- Total de funciones analizadas: 60
- Complejidad promedio del sistema: **5.0**
- Funciones en riesgo bajo (1-10): 59 (98.3%)
- Funciones en riesgo moderado (11-20): 1 (1.7%)
- Funciones en riesgo alto o crítico (21+): 0 (0%)

## Top 5 funciones más complejas

| Complejidad | Función | Archivo | Justificación |
|---|---|---|---|
| 11 | RegistrarLecturaIOT | iot_handler.go | Múltiples validaciones de tipo de evento IoT (Despacho/Recepción) y verificación de producto |
| 10 | CrearProducto | producto_handler.go | Validación de múltiples campos obligatorios y relaciones con categoría/marca |
| 9 | MarcarPedidoEntregado | venta_handler.go | Validación de estado del pedido y actualización en cascada del envío |
| 9 | ActualizarProducto | producto_handler.go | Actualización condicional de múltiples campos opcionales |
| 8 | RecibirProcesoBPM | bpm_handler.go | Transacción con validación de estado y actualización de inventario |

## Análisis

El sistema presenta una complejidad ciclomática saludable en su totalidad. La única
función que supera el umbral de complejidad simple (11, frente al límite de 10) es
`RegistrarLecturaIOT`, la cual maneja el flujo crítico de integración IoT — justificable
dado que debe validar el tipo de dispositivo, el código de barras leído, el tipo de
evento (despacho o recepción) y ejecutar el stored procedure correspondiente con manejo
de errores en cada paso.

No se identificaron funciones en los rangos de riesgo alto (21-50) ni crítico (50+),
lo que indica que el código no requiere refactorización obligatoria. Se recomienda,
como buena práctica, dividir `RegistrarLecturaIOT` en funciones auxiliares más pequeñas
en una futura iteración, aunque no representa un riesgo actual para el mantenimiento
o testing del sistema.

## Herramienta utilizada

- **gocyclo v0.6.0** — https://github.com/fzipp/gocyclo
- Comando ejecutado: `gocyclo -avg .`
- Fecha de análisis: 01/08/2026