# Financiaciones entre dos usuarios

Una financiación mantiene un único registro y un único historial de pagos. Su creador puede invitar por correo exacto a otra cuenta registrada. La invitación aparece en el dashboard del destinatario, caduca a los siete días y requiere aceptación explícita. No se envía correo.

Al aceptar, ambas cuentas ven la financiación y todo su historial. El dashboard y la ordenación por importe pendiente contabilizan la mitad para cada cuenta; el detalle presenta los importes completos y explica el reparto. La opción compartida sin usuario vinculado conserva su comportamiento anterior.

## Permisos

- Creador: editar condiciones, completar/eliminar, pagos extraordinarios, enlaces públicos, invitar y retirar acceso.
- Ambos participantes: consultar y registrar/corregir cuotas ordinarias. Cada cuota representa el pago completo a la entidad; no transferencias ni saldos entre participantes.
- Invitación pendiente: solo muestra el nombre de la financiación y el remitente; no permite consultar su detalle ni cambia importes.

Retirar acceso restaura el valor anterior de `is_shared`, conserva los pagos y bloquea inmediatamente nuevas consultas y modificaciones del participante. La interfaz sincroniza mediante eventos y refresca cada 30 segundos mientras está visible, como respaldo ante desconexiones o retiradas de acceso.

## Modelo y garantías

`debts` contiene `collaborator_id`, nombres públicos capturados al aceptar y `previous_is_shared`. `debt_invitations` almacena remitente, destinatario, vencimiento y estado; las mutaciones solo pasan por rutas autenticadas. Las reglas de lectura permiten al participante únicamente las financiaciones aceptadas. Las reglas normales de escritura siguen reservadas al creador.

`payments.recorded_by` y `recorded_by_name` identifican a quien realizó el último registro o corrección. `sharing_snapshot` conserva el reparto al crear el pago, incluso si luego se retira acceso. Una segunda marca de una cuota ya pagada en una financiación vinculada es idempotente. Los enlaces públicos ocultan los nombres e identificadores de colaboración y los metadatos de autoría.

La creación/edición con invitación opcional es transaccional: si no puede invitarse la cuenta, no se guarda una financiación incompleta. El backend valida los permisos y protege los campos de pertenencia y autoría frente a escrituras directas.

## Validación

`pnpm test:unit` comprueba importes y ordenación personales. `pnpm test:pb` usa un contenedor desechable para invitaciones, permisos, pagos, retirada de acceso, privacidad de enlaces y compatibilidad con las operaciones existentes. `pnpm exec tsc --noEmit` valida los tipos.
