# Plan de contenido indexable — Debt Detox

Documento de trabajo. Define qué páginas públicas crear para captar tráfico
orgánico, por qué esas y no otras, y cómo encajan en la arquitectura actual.

Alcance de esta primera fase: **solo español**. El resto de locales mantienen la
landing actual hasta validar que el contenido funciona.

---

## 1. Diagnóstico

### El problema

El sitio tiene 6 URLs indexables (la home en cada idioma). Todo lo demás
(`/dashboard`, `/profile`, `/debt`, `/share`) está correctamente bloqueado en
`robots.ts` por ser privado. No existe ninguna página que pueda posicionar por
búsquedas informacionales o comparativas.

Las mejoras SEO aplicadas anteriormente (h1 localizado, hreflang, jerarquía de
headings, metadatos) optimizan **cómo** se indexa lo que hay. No aumentan **por
cuántas búsquedas** aparece el sitio. Ese techo solo se sube con contenido nuevo.

### Lo que NO vamos a hacer, y por qué

La propuesta inicial era crear calculadoras financieras (amortización, bola de
nieve vs. avalancha). Se descarta como cabeza de tráfico por dos razones
verificadas:

**a) Son consultas YMYL con SERP saturada por autoridad bancaria.**
Los resultados para `calculadora amortización préstamo` y `bola de nieve vs
avalancha` están ocupados por Banco de España, BBVA, Santander, Bankinter y
Wells Fargo. Google aplica en YMYL (*Your Money or Your Life*) el listón de
E-E-A-T más alto que existe. Un dominio sin historial ni señales de autoridad
financiera no compite ahí a corto ni medio plazo.

**b) La lógica de cálculo no existe en el repo.**
`lib/format.ts` calcula progreso de deudas ya registradas (pagado, restante,
porcentaje), pero no hay ninguna función de interés compuesto, amortización o
TIN/TAE. El tipo `Debt` (`lib/types.ts`) no tiene campo de tipo de interés: el
modelo actual asume financiación a coste cero (`monthly_amount × number_of_payments`).
Construir calculadoras exige implementar ese dominio desde cero.

> Nota aparte: `CLAUDE.md` lista "Record financial details (TIN, TAE, etc.)"
> como funcionalidad, pero no está implementada. Conviene alinear el documento
> con la realidad del código o priorizar la feature.

### El hueco real

Los competidores que rankean para "app para controlar cuotas" son **proveedores
de financiación**: Aplazame, SeQura, Klarna, Sezzle, Afterpay, InOne (CaixaBank).
Todos te prestan dinero y te muestran las cuotas **que ellos mismos te han
concedido**.

Ninguno resuelve el caso de uso que el README ya describe como el problema
central del producto:

> "Cuando llevas varias financiaciones a la vez, lo normal es terminar con hojas
> sueltas, apps bancarias distintas y poco contexto sobre cuánto queda realmente
> por pagar."

Ese es el diferencial: **herramienta neutral, agregada y multi-entidad**. Un
proveedor de BNPL no puede publicar contenido que recomiende una app neutral
para agregar financiaciones de la competencia — tiene un conflicto de interés
estructural. Ese espacio está libre.

---

## 2. Estrategia

Atacar intent **de producto y comparativo**, no informacional-financiero.

| Eje | Descartado | Elegido |
|---|---|---|
| Intent | Informacional ("cómo se calcula X") | Producto ("app para hacer X") |
| Competencia | Bancos, reguladores | Proveedores BNPL con conflicto de interés |
| Exigencia E-E-A-T | Máxima (YMYL) | Moderada (producto/software) |
| Dependencia técnica | Motor de cálculo nuevo | Ninguna, describe lo que la app ya hace |

Ventaja secundaria: este contenido convierte mejor. Quien busca "calculadora de
amortización" quiere un número y se va; quien busca "app para controlar mis
financiaciones" quiere exactamente lo que ofreces.

---

## 3. Páginas propuestas

Cuatro páginas, en orden de prioridad. Cada una responde a un intent distinto y
enlaza a las demás.

### P1 — `/es/controlar-varias-financiaciones`
**Intent:** el usuario tiene 3-4 compras a plazos con entidades distintas y ha
perdido la visión de conjunto.
**Keyword principal:** `controlar varias financiaciones a la vez`
**Secundarias:** `llevar el control de compras a plazos`, `cuánto me queda por pagar en total`
**Ángulo:** el problema de la fragmentación. Por qué las apps del banco y de cada
BNPL no lo resuelven (cada una solo ve lo suyo). Cómo se ve el total agregado.
**Nota:** es la página más cercana al núcleo del producto. Debería ser la primera.

### P2 — `/es/alternativa-hoja-excel-deudas`
**Intent:** el usuario ya lleva un Excel y busca algo mejor.
**Keyword principal:** `plantilla excel control de deudas`
**Secundarias:** `alternativa a excel para deudas`, `hoja de cálculo préstamos`
**Ángulo:** honesto sobre cuándo Excel basta y cuándo se queda corto (recálculo
tras pagos extra, acceso desde el móvil, no romper fórmulas). El tráfico de
"plantilla excel" tiene volumen alto e intent muy cercano al producto.
**Riesgo:** parte de esa búsqueda quiere *descargar una plantilla*, no una app.
Mitigable ofreciendo una plantilla real descargable como gancho.

### P3 — `/es/apps-control-deudas-comparativa`
**Intent:** comparación explícita antes de decidir.
**Keyword principal:** `mejores apps para controlar deudas`
**Ángulo:** comparativa honesta incluyendo alternativas reales (Aplazame, SeQura,
Excel, apps de banco), explicando qué caso resuelve cada una. **Debe incluir
casos donde Debt Detox no es la mejor opción** — una comparativa que siempre gana
la propia herramienta no genera confianza y Google la detecta como contenido
promocional.

### P4 — `/es/compartir-deudas-sin-dar-acceso`
**Intent:** nicho, bajo volumen, altísima especificidad.
**Keyword principal:** `compartir información de deudas con pareja`
**Ángulo:** la feature de enlaces privados compartidos, que ya existe
(`app/share/[token]`) y ningún competidor tiene. Caso de uso: enseñar tu
situación a tu pareja, a un asesor o a un familiar sin dar tus credenciales.
**Volumen bajo, pero competencia casi nula y diferencial 100% real.**

---

## 4. Arquitectura técnica

### Ruta

Las páginas cuelgan de `app/[locale]/` para heredar el layout, i18n y estilos:

```
app/[locale]/
  controlar-varias-financiaciones/page.tsx
  alternativa-hoja-excel-deudas/page.tsx
  apps-control-deudas-comparativa/page.tsx
  compartir-deudas-sin-dar-acceso/page.tsx
```

Con `localePrefix: "as-needed"` y `defaultLocale: "es"`, la URL española queda
sin prefijo: `/controlar-varias-financiaciones`. Correcto y deseable.

**Los slugs se mantienen en español incluso si más adelante se traducen los
contenidos.** Traducir slugs por locale exige `pathnames` en `routing.ts` y
complica el sitemap; no compensa en esta fase.

### Contenido

No hay MDX ni gestor de contenido en el proyecto, y añadirlo para 4 páginas es
desproporcionado. Dos opciones:

1. **JSX directo en cada `page.tsx`** — cero dependencias, control total del
   marcado semántico. Recomendado para 4 páginas.
2. **Añadir `@next/mdx`** — solo justificable si el plan crece a 15+ páginas o
   si vas a escribir tú el contenido sin tocar código.

Los textos van en `messages/es.json` bajo una clave `content.*`, coherente con
el resto del proyecto y dejando la puerta abierta a traducir después.

### Renderizado

Estas páginas son estáticas y **no deben depender de `AuthContext`**. Al no
usar hooks de cliente, pueden ser Server Components puros y prerenderizarse.

Ojo: `ClientLayout` (`components/layout/ClientLayout.tsx`) tiene una regex que
identifica la landing pública:

```
/^\/(?:(es|en|fr|de|pt|nl))?\/?$/
```

Solo hace match con la raíz. **Habrá que extenderla** para que estas rutas no
queden bajo el guard de autenticación, o las tratará como rutas protegidas y
mostrará el spinner de carga.

### Metadata

Cada página exporta `generateMetadata` siguiendo el patrón ya establecido en
`app/[locale]/page.tsx`: `title`, `description`, `alternates.canonical` vía
`getLocalizedUrl()`, y OG/Twitter.

Mientras el contenido sea solo español, **no incluir `alternates.languages`** en
estas páginas: declarar hreflang hacia URLs que no existen en otros idiomas es
un error de configuración que Search Console reporta.

### Sitemap

`app/sitemap.ts` genera hoy una entrada por locale de la home. Hay que
extenderlo para incluir las rutas nuevas. Dado que son solo-español, cada una
entra como **una** URL sin bloque `alternates.languages` — a diferencia de la
home, que sí lo lleva.

Prioridad sugerida: `0.7` (por debajo de la home, por encima de nada).

### Robots

No requiere cambios. `robots.ts` bloquea por prefijo (`/dashboard`, `/profile`,
`/debt`, `/share`) y ninguna ruta nueva colisiona.

**Verificar** que ningún slug futuro empiece por esas cadenas: una página en
`/debt-consolidacion`, por ejemplo, quedaría bloqueada por la regla `/debt`.

### Enlazado interno

Sin enlaces desde la landing, estas páginas quedan huérfanas y Google las
rastrea con baja frecuencia. Añadir enlaces contextuales en el footer
(`components/landing/Footer.tsx`), que hoy solo tiene enlaces externos.

---

## 5. Riesgos y expectativas

**Plazos.** El SEO de contenido no da resultados inmediatos. Indexación:
días-semanas. Posicionamiento con tracción: 3-6 meses. Cualquier expectativa de
tráfico en semanas es irreal.

**Calidad sobre cantidad.** Cuatro páginas buenas superan a doce mediocres.
Google penaliza contenido delgado, y en un dominio pequeño el daño es
proporcionalmente mayor.

**El dominio importa.** `debtdetox.vercel.app` es un subdominio de plataforma.
Para contenido que aspira a competir, un dominio propio es una señal de
seriedad relevante — especialmente en finanzas. Considerarlo antes de invertir
esfuerzo grande en contenido.

**Honestidad en la comparativa.** P3 debe reconocer casos donde otras
herramientas ganan. Es lo correcto y además funciona mejor.

---

## 6. Orden sugerido

1. **P1** — más cercana al producto, valida el enfoque.
2. Medir 4-6 semanas en Search Console (impresiones, no solo clics).
3. Si P1 gana impresiones, seguir con **P2** y **P4**.
4. **P3** al final: las comparativas rinden mejor con algo de autoridad previa.
5. Traducir a inglés solo lo que haya demostrado funcionar en español.

---

## 7. Cambios de código que implica

Resumen para dimensionar, sin implementar:

| Archivo | Cambio |
|---|---|
| `app/[locale]/<slug>/page.tsx` | Nuevo por página: contenido + `generateMetadata` |
| `messages/es.json` | Nueva sección `content.*` con los textos |
| `app/sitemap.ts` | Añadir rutas estáticas sin `alternates` |
| `components/layout/ClientLayout.tsx` | Extender la regex de rutas públicas |
| `components/landing/Footer.tsx` | Enlaces internos al contenido nuevo |

Ninguno toca lógica de negocio, base de datos ni autenticación.
