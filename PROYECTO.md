## **UNIVERSIDAD TÉCNICA DE MACHALA** 

## **FACULTAD DE INGENIERÍA CIVIL** 

**CARRERA DE TECNOLOGÍAS DE LA INFORMACIÓN** 

**NOVENO SEMESTRE PARALELO “A”** 

_**SISTEMA DE INFORMACION GERENCIAL**_ 

## **TechStore Smart Commerce S.A.** 

_“Diseño de un Sistema de Información Gerencial distribuido para la automatización de procesos, gestión de información y apoyo a la toma de decisiones en TechStore Smart Commerce S.A.”_ 

## **Autore:** 

Muñoz Velez Gustavo Enrique Jimbo Ortiz Jordy German Cajamarca Gonzales Israel Stalin 

## **Docente:** 

Ing. Sist. Molina Rios Jimmy Rolando, Phd. 

**MACHALA – EL ORO - ECUADOR** 

**2026 – 1** 

|**1.**|**RESUMEN EJECUTIVO ............................................................................................... 3**|
|---|---|
|**2.**|**IDENTIFICACIÓN DEL PROBLEMA Y SU JUSTIFICACIÓN ............................. 4**|
|**3.**|**REVISIÓN DE LITERATURA...................................................................................... 5**|
||**3.1 Sistemas de Información Gerencial (SIG) ................................................................... 5**|
||**3.2 BPM como metodología de optimización .................................................................... 5**|
||**3.3 ISO 9001 y gestión de calidad ....................................................................................... 6**|
||**3.4 ISO 27001 y seguridad de la información ................................................................... 6**|
||**3.5 Complejidad de McCabe ............................................................................................... 7**|
|**4.**|**SOLUCIÓN PROPUESTA ............................................................................................. 8**|
||**4.1**<br>**Descripción general del SIG .................................................................................... 8**|
||**4.2**<br>**Infraestructura Tecnológica .................................................................................... 9**|
||**4.3**<br>**Diagrama BPMN – Proceso AS-IS ........................................................................ 10**|
||**4.4**<br>**Diagrama BPMN – Proceso Propuesto TO-BE ................................................... 11**|
||**4.5**<br>**Diagrama de Casos de Uso ..................................................................................... 12**|
||**4.6**<br>**Modelo de Datos – Entidad Relación .................................................................... 13**|
||**4.7**<br>**Cambios organizacionales requeridos .................................................................. 14**|
|**5.**|**RESULTADOS ESPERADOS ..................................................................................... 14**|
|**6.**|**REFLEXIONES ............................................................................................................. 16**|
|**7.**|**REFERENCIAS ............................................................................................................. 18**|



## **1. RESUMEN EJECUTIVO** 

TechStore Smart Commerce S.A. es una empresa mediana del sector retail tecnológico dedicada a la comercialización online de laptops, computadoras de escritorio, tablets, smartphones, monitores, impresoras, componentes y accesorios tecnológicos. La organización requiere reconceptualizar su sistema de información para integrar, en una plataforma única y distribuida, los procesos operativos de ventas, inventario, pagos y despacho, junto con las capacidades de análisis gerencial necesarias para apoyar la toma de decisiones estratégicas. 

Actualmente, la empresa carece de un sistema que transforme los datos operativos en información gerencial útil. Las áreas funcionan de forma poco integrada, sin indicadores de desempeño consolidados, sin visibilidad del comportamiento de ventas por período o categoría, y sin reportes que permitan a la gerencia evaluar el rendimiento organizacional de manera oportuna. Esta situación limita la capacidad de respuesta ante cambios del mercado y dificulta la planificación basada en evidencia. 

La propuesta consiste en diseñar un Sistema de Información Gerencial distribuido que centralice la gestión de clientes, catálogo, inventario, pedidos, pagos, despacho, incidencias y reportes ejecutivos. El sistema será desarrollado con Angular en el frontend, Go en el backend y Oracle como gestor de base de datos principal, implementado sobre dos servidores: uno con Trisquel para la base de datos y API REST, y otro con CentOS para la aplicación SIG. Incluirá al menos un proceso BPM automatizado, integración de un dispositivo IoT simulado mediante Node-RED para el control de despachos en bodega, y módulos de reportería gerencial con indicadores clave de desempeño (KPIs) que permitan monitorear ventas, tiempos de despacho, rotación de inventario y comportamiento de clientes. 

El proyecto se fundamenta en los principios de ISO 9001 para la gestión de calidad de procesos y en ISO 27001 para la identificación y control de riesgos de seguridad de la información, incorporando además la métrica de complejidad de McCabe como criterio de evaluación técnica del software desarrollado. 

## **2. IDENTIFICACIÓN DEL PROBLEMA Y SU JUSTIFICACIÓN** 

TechStore Smart Commerce S.A. enfrenta un problema estructural en la gestión de su información organizacional. Las áreas de ventas, inventario, pagos y despacho operan de forma poco integrada, con procesos parcialmente manuales y sin trazabilidad completa sobre el estado de los pedidos. Esto provoca retrasos en la actualización del stock, inconsistencias en la disponibilidad visible al cliente y dificultades para dar seguimiento a las operaciones en tiempo real, afectando directamente la experiencia del usuario y la eficiencia del servicio. 

Un segundo problema crítico es la ausencia de automatización formal de procesos. La empresa no cuenta con flujos BPM definidos para actividades clave como la validación de stock, la confirmación de pago, la preparación del pedido y su despacho. Al depender de revisiones manuales en cada etapa, aumenta la probabilidad de errores, se generan cuellos de botella operativos y se reduce la capacidad de escalar el negocio sin incrementar proporcionalmente el personal. 

Desde la perspectiva gerencial, el problema más significativo es que la organización no dispone de un sistema que transforme los datos operativos en información estratégica útil para la toma de decisiones. La gerencia no cuenta con dashboards consolidados, indicadores de desempeño (KPIs) ni reportes que permitan analizar tendencias de ventas, comportamiento de clientes, rentabilidad por categoría de producto o eficiencia en los tiempos de entrega. La ISO 9001 establece que las decisiones basadas en evidencia aumentan la probabilidad de alcanzar resultados eficaces, lo que exige disponer de mecanismos de medición, monitoreo y análisis del desempeño organizacional; condición que la empresa actualmente no cumple. 

Finalmente, la organización enfrenta riesgos relevantes en materia de seguridad de la información. En entornos de comercio electrónico, los riesgos más frecuentes incluyen el acceso no autorizado a datos de clientes, historial de compras y registros de pago, así como vulnerabilidades ante phishing y otras amenazas durante transacciones digitales. Estos riesgos, identificados bajo el marco de ISO 27001, justifican incorporar controles de seguridad desde el diseño del sistema y no como medidas correctivas posteriores. En conjunto, estos cuatro factores justifican el diseño e implementación de un SIG funcional, distribuido y orientado a la toma de decisiones, capaz de automatizar procesos, centralizar información, generar reportes gerenciales y reducir riesgos operativos y de seguridad. 

## **3. REVISIÓN DE LITERATURA** 

## **3.1 Sistemas de Información Gerencial (SIG)** 

Un Sistema de Información Gerencial constituye un conjunto integrado de procesos destinados a recopilar, procesar, organizar y distribuir información relevante tanto para la operación diaria como para la toma de decisiones estratégicas en una organización [1]. Según Laudon y Laudon, los principales objetivos que impulsan el uso de los SIG en las empresas contemporáneas son la excelencia operacional, la mejora en la toma de decisiones y la ventaja competitiva, demostrando que existe una conexión directa entre el desempeño del negocio y la calidad de su sistema de información [2]. 

El valor de un SIG no se limita al registro transaccional de operaciones. Lapiedra et al. señalan que los sistemas de información convergen con toda la cadena de valor de las empresas, y que los datos solo se convierten en información verdaderamente útil cuando están disponibles en la cantidad oportuna y en el momento preciso para quienes deben tomar decisiones [1]. Esto implica que un SIG debe atender tres niveles de información: el nivel operativo (registro de transacciones), el nivel táctico (seguimiento de procesos y tendencias) y el nivel estratégico (análisis para decisiones de alto impacto gerencial). 

En una empresa mediana de retail tecnológico como TechStore Smart Commerce S.A., esta integración de niveles se traduce en módulos que van desde la gestión de ventas, inventario y despacho, hasta dashboards ejecutivos con indicadores clave de desempeño (KPIs) sobre rentabilidad, comportamiento de clientes y eficiencia operativa. Sin este componente analítico, el sistema sería un simple registro transaccional y no cumpliría su función gerencial. 

## **3.2 BPM como metodología de optimización** 

Business Process Management (BPM) se define como el arte y la ciencia de cómo debe ejecutarse el trabajo en una organización para garantizar resultados consistentes y aprovechar oportunidades de mejora, ya sea reduciendo costos, tiempos de ejecución o tasas de error [3]. Dumas et al. subrayan que BPM no se ocupa de mejorar actividades individuales de manera aislada, sino de gestionar cadenas completas de eventos, actividades y decisiones que generan valor para la organización y sus clientes [3]. 

La metodología BPM abarca un ciclo de vida completo que incluye la identificación del proceso, su modelado, análisis, rediseño, automatización y monitoreo continuo [3]. En la práctica, esto se traduce en representar la situación actual del negocio mediante un modelo AS-IS, identificar sus ineficiencias y diseñar un modelo mejorado TO-BE que sirva como base para la automatización. Para TechStore, el proceso de gestión de pedidos online es el candidato natural: recorre desde la recepción del pedido hasta la confirmación de entrega, con múltiples puntos de validación que hoy dependen de intervención manual, generando cuellos de botella y riesgo de error. 

La principal ventaja de aplicar BPM en este contexto es que permite pasar de operaciones aisladas a procesos formalmente definidos, medibles y automatizables dentro del SIG. Un proceso automatizado 

genera, además, datos trazables que alimentan directamente los módulos de reportería gerencial, cerrando el ciclo entre operación y toma de decisiones. 

## **3.3 ISO 9001 y gestión de calidad** 

La norma ISO 9001:2015 es un estándar internacional de sistemas de gestión de calidad estructurado sobre siete principios fundamentales: enfoque al cliente, liderazgo, participación del personal, enfoque basado en procesos, mejora continua, toma de decisiones basada en evidencia, y gestión de las relaciones [4]. Su aplicación en el diseño de un SIG es directamente pertinente, ya que dos de estos principios definen con precisión los requisitos de información que debe satisfacer el sistema. 

El primero es el enfoque basado en procesos, que promueve entender las actividades de la organización como un sistema interrelacionado en lugar de funciones aisladas [4]. Esto justifica la integración de todos los módulos del SIG bajo una arquitectura distribuida unificada, donde los datos de ventas, inventario, pagos y despacho fluyen de manera coherente y sin duplicidad. 

El segundo es la toma de decisiones basada en evidencia, sexto principio de la norma, que establece que las decisiones respaldadas en el análisis y evaluación de datos tienen mayor probabilidad de producir los resultados deseados [4][5]. Concretamente, la norma requiere que la organización disponga de mecanismos de seguimiento, medición y análisis para evaluar el desempeño de sus procesos, utilizando como insumos datos operativos, registros de auditoría e indicadores de conformidad [5]. En el contexto de TechStore, este principio se materializa en el módulo de reportería gerencial del SIG: indicadores de ventas por período, tasa de cumplimiento de pedidos, tiempos promedio de despacho y niveles de devolución constituyen la evidencia que la gerencia requiere para tomar decisiones con sustento objetivo. 

## **3.4 ISO 27001 y seguridad de la información** 

La norma ISO/IEC 27001:2022 establece los requisitos para implementar, mantener y mejorar un Sistema de Gestión de Seguridad de la Información (SGSI), con el objetivo de proteger los activos de información frente a amenazas que puedan comprometer su confidencialidad, integridad y disponibilidad [6]. La confidencialidad, en particular, se refiere a garantizar que la información solo sea accesible por personas autorizadas; su vulneración expone a la organización a pérdidas financieras, daño reputacional y consecuencias legales [6]. 

En plataformas de comercio electrónico, los riesgos de seguridad de la información son especialmente significativos. Entre las amenazas más frecuentes identificadas bajo el marco de ISO 27001 se encuentran el phishing, el malware, los ataques de intermediario (man-in-the-middle) y el acceso no autorizado mediante sistemas o credenciales comprometidas [7]. Para TechStore Smart Commerce S.A. se identifican dos riesgos prioritarios que deben atenderse desde el diseño del sistema: primero, el acceso no autorizado a datos sensibles de clientes, historial de compras y registros de pago, cuya exposición 

podría vulnerar la confianza del usuario y la continuidad del negocio [6]; segundo, la interceptación o manipulación de información durante transacciones digitales, facilitada por técnicas de phishing o ingeniería social dirigidas tanto a clientes como al personal interno [7]. 

Ambos riesgos deben abordarse mediante controles preventivos integrados al diseño del SIG: autenticación multifactor, cifrado de comunicaciones, gestión de accesos por roles y políticas de seguridad documentadas, conforme a los controles del Anexo A de ISO/IEC 27001:2022 [6]. 

## **3.5 Complejidad de McCabe** 

La complejidad ciclomática es una métrica de software desarrollada por Thomas J. McCabe en 1976, publicada originalmente en IEEE Transactions on Software Engineering, que mide la complejidad estructural de un programa mediante el recuento del número de caminos linealmente independientes en su flujo de control [8]. Su formulación se basa en la teoría de grafos y se expresa como M = E − N + 2P, donde E es el número de aristas del grafo de control, N es el número de nodos y P es el número de componentes conectados; para un módulo individual con un único componente, la fórmula se simplifica a M = E − N + 2 [9]. 

McCabe propuso además una escala de riesgo asociada a los valores resultantes: complejidad entre 1 y 10 corresponde a un procedimiento simple de bajo riesgo; entre 11 y 20 indica complejidad moderada; entre 21 y 50 señala alto riesgo; y valores superiores a 50 corresponden a código prácticamente no testeable [8]. Esta métrica ha sido históricamente correlacionada con atributos de calidad del software como mantenibilidad, reutilizabilidad y propensión a fallos, y se reconoce como una guía eficiente para el diseño de casos de prueba [9]. 

En el contexto del SIG de TechStore, aplicar la complejidad de McCabe permite evaluar objetivamente los módulos más críticos del backend —como el proceso automatizado de gestión de pedidos o los servicios de validación de pagos en Go— identificando aquellos que, por su alta complejidad lógica, requieren mayor cobertura de pruebas o refactorización antes de su puesta en producción. 

## **4. SOLUCIÓN PROPUESTA** 

## **4.1 Descripción general del SIG** 

Se propone el diseño e implementación de un Sistema de Información Gerencial distribuido para TechStore Smart Commerce S.A., estructurado en seis módulos funcionales integrados que cubren desde las operaciones de bodega hasta el análisis ejecutivo en tiempo real. El sistema centraliza la gestión de información de todas las áreas operativas en una plataforma única, permitiendo a la gerencia tomar decisiones basadas en datos actualizados y trazables. 

El SIG no es un sistema de comercio electrónico ni un simple gestor de inventario: su propósito principal es transformar los datos operativos generados por ventas, compras, bodega y logística en información estratégica accesible para la gerencia. Cada módulo alimenta el dashboard central con métricas e indicadores clave de desempeño (KPIs), cerrando el ciclo entre operación y decisión. 

## **Los seis módulos del sistema son:** 

**Módulo 1 – Dashboard Gerencial** : Constituye la capa de inteligencia del SIG. Presenta en tiempo real métricas críticas para la toma de decisiones: stock en niveles críticos, historial y tendencias de ventas por período o categoría, rendimiento operativo de bodega (tiempos de preparación de pedidos), estado de órdenes de compra pendientes y alertas del sistema. Este módulo consume datos de todos los demás módulos mediante la API REST y los presenta en gráficos, tablas y tarjetas de indicadores accesibles exclusivamente para usuarios con rol gerencial. 

**Módulo 2 – Catálogo e Inventario** : Núcleo operativo del sistema. Gestiona el registro de productos por categoría y marca, los niveles de stock por ubicación en bodega, y las reglas de reabastecimiento. Cuando el stock de un producto desciende por debajo del límite mínimo configurado, el sistema genera automáticamente una alerta visible en el dashboard y, opcionalmente, activa una orden de compra en el Módulo 4, sin intervención manual. Este comportamiento automatizado constituye uno de los elementos BPM del sistema. 

**Módulo 3 – Ventas y Clientes** : Gestiona el registro y seguimiento de clientes, el historial completo de compras por cliente y el punto de venta tipo POS para registro de transacciones. Al confirmar una venta, el sistema genera automáticamente la factura correspondiente, actualiza el inventario y dispara la solicitud de preparación al Módulo 6 (IoT–Bodega). El historial de ventas alimenta los reportes del dashboard gerencial. 

**Módulo 4 – Compras y Proveedores (BPM):** Gestiona el registro de proveedores, la creación y seguimiento de órdenes de compra y el detalle de los pedidos realizados. Este módulo implementa el proceso BPM funcional del sistema: puede activarse automáticamente desde el Módulo 2 cuando el inventario cae bajo el mínimo, o iniciarse manualmente por el área de compras. El flujo BPM 

automatizado comprende: detección de stock crítico → generación de orden de compra → aprobación → envío al proveedor → recepción de mercadería → actualización de inventario. 

**Módulo 5 – Seguridad (ISO 27001):** Implementa los controles de seguridad de la información alineados con ISO/IEC 27001:2022. Incluye autenticación con doble factor (2FA) para todos los usuarios del sistema y un sistema de control de roles y permisos que restringe el acceso a cada módulo según el perfil del usuario (Gerente, Administrador, Vendedor, Bodeguero). Ninguna operación de base de datos es accesible directamente; todas pasan exclusivamente por la API REST, que valida autenticación y permisos en cada solicitud. 

**Módulo 6 – IoT – Bodega** : Integra el proceso físico de preparación de pedidos con el sistema de información. Cuando el Módulo 3 confirma una venta, se genera automáticamente una solicitud de preparación en bodega. El operario recibe la solicitud en su terminal, escanea cada producto con un lector de barras (dispositivo IoT simulado) y el sistema registra los ítems despachados y el tiempo total de preparación. Este tiempo se convierte en métrica operativa que aparece en el dashboard gerencial como indicador de rendimiento de bodega. 

La simulación del dispositivo IoT se implementa mediante Node-RED, una plataforma de programación visual basada en flujos que permite modelar el comportamiento del lector de barras sin requerir hardware físico. Cada escaneo simulado en Node-RED genera un evento que se envía como petición HTTP a la API REST del backend en Go, el cual procesa la lectura, actualiza el inventario y registra la operación en la base de datos Oracle [10]. 

## **4.2 Infraestructura Tecnológica** 

|**Componente**|**Tecnología**|J**ustificación**||
|---|---|---|---|
|**Frontend**|Angular|Framework<br>SPA|<br>robusto<br>para|
|||interfaces gerenciales complejas con||
|||componentes reutilizables y binding||
|||reactivo||
|**Backend**|Go|Alto rendimiento,|manejo eficiente|
|||de concurrencia, ideal para servicios||
|||distribuidos||
|**Base de datos principal**|Oracle|Soporte nativo para transacciones||
|||ACID,<br>manejo|de<br>grandes|
|||volúmenes<br>y|procedimientos|
|||almacenados||



|**Servidor 1**|Trisquel + Oracle +|Trisquel + Oracle +|Aloja Oracle DB y la API REST en|
|---|---|---|---|
||API REST en Go||Go; sistema libre, estable para|
||||producción|
|**Servidor 2**|Máquina virtual con||Máquina virtual con<br>Aloja<br>la<br>aplicación<br>Angular|
||CentOS + aplicación||CentOS + aplicación<br>compilada; separación entre capa de|
||Angular||presentación y capa de datos|
|**Control de versiones**|GitHub||Gestión colaborativa del código|
||||fuente, integración continua|
|**BPM**|Proceso||Gestión de órdenes de compra|
||automatizado|de|de<br>activada desde inventario|
||gestión de pedidos|gestión de pedidos||
|**IoT**|Node-RED + lector||Node-RED + lector<br>Plataforma de flujos visuales basada|
||de barras simulado|de barras simulado|en<br>Node.js<br>que<br>simula<br>el|
||||comportamiento del lector de barras|
||||en bodega; genera eventos de|
||||despacho y los envía a la API REST|
||||en Go|



Tabla 1. Infraestructura Tecnológica. Fuente: Elaboración Propia. 

La arquitectura distribuida separa deliberadamente las responsabilidades: el Servidor 1 actúa como capa de datos y lógica de negocio (Oracle + Go), mientras que el Servidor 2 actúa como capa de presentación (Angular). Toda comunicación entre ambas capas ocurre exclusivamente a través de la API REST desarrollada en Go, lo que garantiza que ningún cliente accede directamente a la base de datos, reforzando el control de seguridad requerido por ISO 27001. 

## **4.3 Diagrama BPMN – Proceso AS-IS** 

_Figura 1. Diagrama BPMN – Proceso AS-IS. Fuente: Elaboración Propia._ 

Actualmente, el proceso de reabastecimiento de inventario en TechStore depende de revisiones manuales periódicas por parte del encargado de bodega. Cuando detecta visualmente un nivel bajo de stock, notifica verbalmente o por mensajería al área de compras, que elabora manualmente una orden y la envía al proveedor sin un flujo formal de aprobación. No existe trazabilidad del proceso ni registro sistemático de tiempos o resultados. 

## **4.4 Diagrama BPMN – Proceso Propuesto TO-BE** 

_Figura 2. Diagrama BPMN – Propuesto TO-BE. Fuente: Elaboración Propia._ 

Con el SIG implementado, el proceso de compras se automatiza mediante BPM. El sistema monitorea el inventario en tiempo real; al detectar stock bajo el mínimo, genera automáticamente una orden de compra preliminar y notifica al gerente para su aprobación en el dashboard. Una vez aprobada, la orden se envía al proveedor y queda registrada. Al recibir la mercadería, el bodeguero confirma la recepción escaneando los productos con el lector IoT, actualizando el inventario automáticamente. 

## **4.5 Diagrama de Casos de Uso** 

_Figura 3. Diagrama de Casos de Uso. Fuente: Elaboración Propia._ 

Los actores principales del sistema son: Gerente (accede al dashboard, aprueba órdenes de compra, consulta reportes), Administrador (gestiona usuarios, roles y configuración del sistema), Vendedor (registra ventas, gestiona clientes, emite facturas), Bodeguero (procesa solicitudes de despacho, escanea productos con IoT), y Proveedor (actor externo receptor de órdenes de compra). 

## **4.6 Modelo de Datos – Entidad Relación** 

_Figura 4. Diagrama ER. Fuente: Elaboración Propia_ 

## **4.7 Cambios organizacionales requeridos** 

La implementación del SIG requiere ajustes en la operación interna de TechStore. El personal de bodega deberá capacitarse en el uso del módulo IoT–Bodega y en la operación del flujo Node-RED que simula el lector de barras. El área de compras deberá adoptar el flujo BPM formal para toda orden, eliminando las comunicaciones informales. La gerencia deberá incorporar la revisión periódica del dashboard como práctica de gestión. Se recomienda designar un administrador del sistema responsable de la gestión de usuarios, roles y mantenimiento de la plataforma. 

## **5. RESULTADOS ESPERADOS** 

La implementación del Sistema de Información Gerencial distribuido en TechStore Smart Commerce S.A. permitirá alcanzar resultados medibles en tres dimensiones: eficiencia operativa, calidad de la información y capacidad gerencial de toma de decisiones. 

En el plano operativo, se espera eliminar las revisiones manuales de inventario mediante la automatización del proceso de reabastecimiento. El flujo BPM implementado en el Módulo 4 reducirá los tiempos de generación de órdenes de compra, garantizará trazabilidad completa de cada pedido a proveedores y disminuirá el riesgo de desabastecimiento por falta de alertas oportunas. De igual forma, la integración del módulo IoT–Bodega, implementado con Node-RED como simulador del lector de barras, permitirá registrar automáticamente cada despacho, reduciendo errores de picking y generando métricas de tiempo de preparación por pedido que actualmente no existen. 

En cuanto a la gestión de ventas, el módulo POS con generación automática de facturas reemplazará el registro manual, acelerando el proceso de atención al cliente y garantizando que cada transacción quede vinculada al historial del cliente, al inventario actualizado y al proceso de despacho de manera inmediata. Se estima una reducción significativa en el tiempo promedio de procesamiento de una venta completa, desde el registro hasta la confirmación de despacho. 

Desde la perspectiva gerencial, el resultado más relevante será la disponibilidad de información consolidada y en tiempo real a través del Dashboard Gerencial. Por primera vez, la gerencia de TechStore podrá visualizar indicadores como el volumen de ventas por período, los productos con mayor rotación, los niveles críticos de stock, el rendimiento de bodega y el estado de las órdenes de compra activas, sin depender de reportes manuales elaborados por otras áreas. Esto representa un cambio estructural en la forma en que se toman decisiones dentro de la organización, alineándose con el principio de toma de decisiones basada en evidencia de ISO 9001 [4][5]. 

En materia de seguridad, la implementación del Módulo 5 con autenticación 2FA y control de acceso por roles reducirá el riesgo de acceso no autorizado a información sensible, uno de los riesgos 

identificados bajo ISO 27001 [6]. Cada operación del sistema quedará registrada con el usuario que la ejecutó, generando una trazabilidad de auditoría que actualmente no existe. 

Finalmente, desde el punto de vista técnico, la aplicación de la métrica de complejidad de McCabe sobre los módulos críticos del backend permitirá identificar componentes con alta complejidad lógica antes de la entrega final, orientando decisiones de refactorización y garantizando un nivel de calidad técnica del software que facilite su mantenimiento y evolución futura [8][9]. 

En síntesis, el SIG transformará a TechStore Smart Commerce S.A. de una organización que reacciona a problemas operativos hacia una organización que anticipa situaciones, gestiona con datos y toma decisiones con respaldo informacional sólido. 

## **6. REFLEXIONES** 

## **Muñoz Vélez Gustavo Enrique** 

Mi participación en este proyecto se centró principalmente en la documentación, la redacción general del trabajo y la elaboración de la revisión de literatura. Una de las primeras dificultades que enfrenté fue entender la diferencia real entre un sistema transaccional y un Sistema de Información Gerencial. Al inicio, el proyecto tendía a describirse como un sistema de bodega o de e-commerce, y fue necesario reorientar la propuesta para que el centro del sistema fuera la toma de decisiones gerencial y no simplemente el registro de operaciones. Ese proceso de reenfoque me hizo comprender que un SIG no se define por las tecnologías que usa, sino por el propósito que cumple: transformar datos operativos en información útil para quien dirige la organización. En la redacción de la revisión de literatura aprendí a sustentar decisiones de diseño con marcos normativos reales. Antes veía ISO 9001 e ISO 27001 como requisitos formales del proyecto académico; al desarrollar cada sección entendí que estos estándares tienen implicaciones concretas sobre cómo se estructura el sistema: la ISO 9001 justifica por qué el dashboard gerencial es el módulo más importante del SIG, y la ISO 27001 explica por qué el control de acceso por roles y el 2FA no son opcionales sino controles necesarios desde el diseño. 

## **Jimbo Ortiz Jordy Germán** 

Mi contribución al proyecto se distribuyó entre la definición técnica de la arquitectura distribuida, la selección del stack tecnológico y el diseño de la base de datos. Proponer la separación entre el Servidor 1 con Oracle y Go, y el Servidor 2 con Angular, no fue solo una decisión de infraestructura sino una decisión de seguridad: al forzar que toda comunicación pase por la API REST, se elimina el acceso directo a la base de datos desde el cliente, alineando la arquitectura con los controles de ISO 27001. Seleccionar el stack tecnológico también implicó entender por qué cada herramienta tiene sentido en este contexto: Go por su rendimiento en servicios concurrentes, Oracle por su soporte a transacciones ACID, y Node-RED por su capacidad de simular eventos IoT sin necesidad de hardware físico. El diseño de la base de datos con 18 entidades fue el ejercicio más exigente de mi parte en este proyecto. Cada entidad debía tener un propósito funcional claro y estar conectada con lógica real al flujo de operaciones del sistema. Entender cómo LECTURA_IOT se vincula con ENVIO y PRODUCTO, o cómo PROCESO_BPM conecta INVENTARIO con PROVEEDOR a través de un flujo automatizado, me permitió comprender que el modelo de datos no es solo una lista de tablas, sino el esqueleto que sostiene todos los procesos del SIG. 

## **Cajamarca Gonzales Israel Stalin** 

Mi aporte en este proyecto estuvo orientado al diseño de los diagramas BPMN, el diagrama de casos de uso y la definición de los resultados esperados del sistema. Elaborar el diagrama AS-IS fue un ejercicio revelador porque obligó a documentar con precisión cómo funcionan actualmente los procesos de la empresa, evidenciando de forma visual los cuellos de botella, las comunicaciones informales y la falta de trazabilidad que justifican todo el proyecto. Diseñar el TO-BE fue igualmente desafiante porque cada paso del proceso optimizado debía tener coherencia con las decisiones técnicas tomadas por el equipo: el flujo BPM automatizado, la integración IoT con Node-RED y la actualización en tiempo real del dashboard gerencial. A través del diagrama de casos de uso aprendí a identificar con precisión qué actor hace qué dentro del sistema, entendiendo que los roles no son solo perfiles de usuario sino la base sobre la que se construye el control de acceso exigido por ISO 27001. Este proyecto me enseñó que diseñar un sistema de información gerencial requiere pensar simultáneamente en el negocio, los procesos, los datos y la seguridad, y que solo cuando esas cuatro dimensiones están alineadas el sistema cumple realmente su propósito estratégico. 

## **7. REFERENCIAS** 

[1] R. Lapiedra, C. Devece y J. Guiral, Introducción a la gestión de sistemas de información en la empresa. Castellón de la Plana: Universitat Jaume I, 2016. 

[2] K. C. Laudon y J. P. Laudon, Sistemas de información gerencial, 14.ª ed. Ciudad de México: Pearson Educación, 2020. 

[3] M. Dumas, M. La Rosa, J. Mendling y H. A. Reijers, Fundamentals of Business Process Management, 2.ª ed. Berlín: Springer, 2018. 

[4] International Organization for Standardization, ISO 9001:2015 — Quality management systems — Requirements. Ginebra: ISO, 2015. 

[5] International Organization for Standardization, ISO 9000:2015 — Quality management systems — Fundamentals and vocabulary. Ginebra: ISO, 2015. 

[6] International Organization for Standardization, ISO/IEC 27001:2022 — Information security, cybersecurity and privacy protection — Information security management systems — Requirements. Ginebra: ISO, 2022. 

[7] PECB, "ISO/IEC 27002:2022 — Information security, cybersecurity and privacy protection," PECB Whitepaper, 2022. [En línea]. Disponible: https://pecb.com/en/whitepaper/isoiec-270022022information-security-cybersecurity-and-privacy-protection 

[8] T. J. McCabe, "A complexity measure," IEEE Transactions on Software Engineering, vol. SE-2, núm. 4, pp. 308–320, dic. 1976. 

[9] M. Al-Subaihin y F. Sarro, "Calculating McCabe's cyclomatic complexity metric and its effect on the quality aspects of software," ResearchGate, 2023. [En línea]. Disponible: https://www.researchgate.net/publication/370470871 

[10] OpenJS Foundation, "Node-RED: Low-code programming for event-driven applications," NodeRED Documentation, 2024. [En línea]. Disponible: https://nodered.org/docs/ 

