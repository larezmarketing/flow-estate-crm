# Especificación de Requerimientos - CRM Inmobiliario

**Versión:** 1.0  
**Fecha:** Febrero 2026  
**Autor:** Flow Estate  
**Estado:** Documento de Especificación Técnica

---

## 1. Introducción

### 1.1 Propósito del Documento

Este documento define los requerimientos técnicos y funcionales para el desarrollo de **Flow Estate CRM**, un sistema de gestión de relaciones con clientes especializado en el sector inmobiliario. El CRM está diseñado para automatizar y optimizar el ciclo de vida del cliente, desde la captura de leads hasta el cierre de deals.

### 1.2 Alcance del Proyecto

El sistema incluye módulos de gestión de leads, deals, asignación automática mediante round robin, integraciones con plataformas de publicidad digital, comunicación multicanal (WhatsApp, SMS, Email, Llamadas), y herramientas de productividad integradas.

### 1.3 Audiencia Objetivo

- Agentes inmobiliarios
- Gerentes de ventas
- Administradores del CRM
- Directores de operaciones

---

## 2. Descripción General del Sistema

### 2.1 Visión del Producto

Flow Estate CRM es una plataforma integral que centraliza la gestión de clientes potenciales y oportunidades de venta en el sector inmobiliario, integrando herramientas de comunicación, automatización y análisis para maximizar la eficiencia operativa y las tasas de conversión.

### 2.2 Objetivos Principales

- Centralizar la información de leads y deals en una única plataforma
- Automatizar la asignación de leads mediante algoritmos de round robin
- Facilitar la comunicación multicanal (WhatsApp, SMS, Email, Llamadas)
- Integrar fuentes de generación de leads (Meta, Google Ads)
- Automatizar flujos de trabajo mediante n8n
- Proporcionar visibilidad en tiempo real del estado de las oportunidades
- Mejorar la productividad mediante integración con herramientas de calendario y email

---

## 3. Módulos Principales

### 3.1 Módulo de Gestión de Leads

#### 3.1.1 Descripción
Sección dedicada a la captura, almacenamiento y gestión de clientes potenciales (leads) provenientes de múltiples canales.

#### 3.1.2 Funcionalidades Principales

**Captura de Leads:**
- Formularios web personalizables
- Integración automática de leads desde Meta Ads
- Integración automática de leads desde Google Ads
- Importación masiva de leads (CSV, Excel)
- API para integraciones de terceros

**Gestión de Información:**
- Almacenamiento de datos personales: nombre, teléfono, email, ubicación
- Datos de propiedad de interés: tipo de propiedad, presupuesto, zona geográfica
- Historial completo de interacciones
- Etiquetado y categorización de leads
- Estado del lead: Nuevo, Contactado, Calificado, Descalificado, Convertido

**Búsqueda y Filtrado:**
- Búsqueda avanzada por múltiples criterios
- Filtros dinámicos: estado, fuente, agente asignado, fecha de creación
- Vistas personalizables por usuario
- Exportación de datos en múltiples formatos

#### 3.1.3 Campos de Datos Mínimos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| ID Lead | UUID | Sí | Identificador único |
| Nombre Completo | Texto | Sí | Nombre del cliente potencial |
| Email | Email | Sí | Correo electrónico |
| Teléfono | Teléfono | Sí | Número de contacto |
| Fuente | Selección | Sí | Meta Ads, Google Ads, Formulario Web, Manual |
| Tipo de Propiedad | Selección | No | Apartamento, Casa, Terreno, Comercial |
| Presupuesto | Moneda | No | Rango de presupuesto |
| Zona de Interés | Texto | No | Ubicación geográfica deseada |
| Estado | Selección | Sí | Nuevo, Contactado, Calificado, etc. |
| Agente Asignado | Relación | No | Usuario responsable |
| Fecha de Creación | Fecha/Hora | Sí | Timestamp automático |
| Última Interacción | Fecha/Hora | No | Última comunicación registrada |
| Notas | Texto Largo | No | Observaciones adicionales |

---

### 3.2 Módulo de Gestión de Deals

#### 3.2.1 Descripción
Sección para el seguimiento de oportunidades de venta, desde la calificación del lead hasta el cierre de la transacción.

#### 3.2.2 Funcionalidades Principales

**Creación y Seguimiento de Deals:**
- Conversión automática de leads calificados a deals
- Creación manual de deals
- Vinculación de múltiples leads a un deal
- Etapas del deal: Prospección, Negociación, Propuesta, Cierre Pendiente, Ganado, Perdido
- Probabilidad de cierre (0-100%)
- Valor estimado del deal
- Fecha de cierre esperada

**Historial de Interacciones:**
- Registro de todas las comunicaciones asociadas al deal
- Visualización de mensajes de WhatsApp dentro del deal
- Visualización de llamadas registradas
- Visualización de emails intercambiados
- Notas y comentarios internos del equipo
- Actividades programadas y completadas

**Gestión de Propiedades:**
- Vinculación de propiedades inmobiliarias al deal
- Detalles de la propiedad: dirección, características, precio
- Documentación asociada (fotos, planos, certificados)
- Historial de cambios en el deal

#### 3.2.3 Campos de Datos Mínimos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| ID Deal | UUID | Sí | Identificador único |
| Lead Asociado | Relación | Sí | Referencia al lead principal |
| Propiedad | Relación | No | Propiedad inmobiliaria asociada |
| Etapa | Selección | Sí | Estado actual del deal |
| Valor | Moneda | Sí | Monto de la transacción |
| Probabilidad | Porcentaje | No | Probabilidad de cierre (0-100%) |
| Fecha Cierre Esperada | Fecha | No | Fecha estimada de conclusión |
| Agente Responsable | Relación | Sí | Usuario asignado |
| Fecha Creación | Fecha/Hora | Sí | Timestamp automático |
| Última Actualización | Fecha/Hora | Sí | Timestamp de cambio |

---

### 3.3 Módulo de Round Robin

#### 3.3.1 Descripción
Sistema automático de asignación de leads a agentes basado en algoritmos de distribución equitativa.

#### 3.3.2 Funcionalidades Principales

**Configuración de Grupos:**
- Creación de grupos de agentes
- Asignación de prioridades por agente
- Definición de criterios de asignación (zona geográfica, tipo de propiedad, presupuesto)
- Horarios de disponibilidad

**Algoritmos de Distribución:**
- Round robin simple: distribución secuencial
- Round robin ponderado: distribución según carga de trabajo actual
- Asignación por especialización: según tipo de propiedad o zona
- Asignación manual con sugerencias automáticas

**Monitoreo y Reportes:**
- Dashboard de distribución de leads
- Métricas de carga por agente
- Historial de asignaciones
- Alertas cuando un agente alcanza límite de leads

#### 3.3.3 Configuración Técnica

```
Parámetros de Round Robin:
- Algoritmo: Round Robin Ponderado
- Factor de ponderación: Número de leads activos por agente
- Intervalo de recalcular: Cada 5 minutos
- Máximo de leads por agente: Configurable por grupo
- Criterios de filtrado: Zona, tipo propiedad, presupuesto, especialización
```

---

## 4. Integraciones Externas

### 4.1 Meta Ads (Facebook/Instagram)

#### 4.1.1 Descripción
Integración automática para capturar leads generados a través de campañas publicitarias en Meta.

#### 4.1.2 Funcionalidades

**Captura de Leads:**
- Sincronización automática de leads desde formularios de Meta Ads
- Mapeo de campos de Meta a campos del CRM
- Webhook para recepción en tiempo real de nuevos leads
- Sincronización de datos demográficos y de comportamiento

**Datos Capturados:**
- Información de contacto (nombre, email, teléfono)
- Datos demográficos (edad, ubicación, género)
- Historial de interacciones con anuncios
- Fuente de tráfico y campaña asociada

#### 4.1.3 Requisitos Técnicos

- Credenciales de Meta Business Account
- Acceso a Meta Ads API v18.0+
- Webhook endpoint configurado en Meta
- Validación de tokens y seguridad

---

### 4.2 Google Ads

#### 4.2.1 Descripción
Integración automática para capturar leads de campañas en Google Ads.

#### 4.2.2 Funcionalidades

**Captura de Leads:**
- Sincronización de leads desde Google Ads Lead Form Extensions
- Integración con Google Customer Match
- Mapeo automático de datos
- Webhook para actualizaciones en tiempo real

**Datos Capturados:**
- Información de contacto completa
- Palabras clave de búsqueda que generaron el lead
- Datos de la campaña y grupo de anuncios
- Información de dispositivo y ubicación

#### 4.2.3 Requisitos Técnicos

- Credenciales de Google Ads API
- Configuración de Lead Form Extensions
- Webhook endpoint
- Validación de autenticación OAuth 2.0

---

### 4.3 n8n - Automatización de Flujos

#### 4.3.1 Descripción
Plataforma de automatización para crear flujos de trabajo complejos sin código.

#### 4.3.2 Funcionalidades

**Flujos de Automatización Principales:**

**Flujo 1: Captura y Calificación de Leads**
```
Trigger: Nuevo lead en CRM
├─ Validar datos de contacto
├─ Consultar base de datos de propiedades
├─ Asignar lead mediante round robin
├─ Enviar notificación al agente (Email/WhatsApp)
└─ Crear tarea de seguimiento
```

**Flujo 2: Escalada de Leads Inactivos**
```
Trigger: Lead sin interacción por 7 días
├─ Verificar estado del lead
├─ Enviar recordatorio al agente
├─ Si sigue inactivo por 14 días
├─ Reasignar a otro agente
└─ Registrar en log de escaladas
```

**Flujo 3: Sincronización de Datos**
```
Trigger: Cambio en lead o deal
├─ Actualizar campos relacionados
├─ Sincronizar con integraciones externas
├─ Registrar auditoría de cambios
└─ Notificar usuarios interesados
```

**Flujo 4: Generación de Reportes**
```
Trigger: Programado (diario/semanal/mensual)
├─ Compilar métricas de leads y deals
├─ Calcular KPIs
├─ Generar reportes en PDF
└─ Enviar por email a stakeholders
```

#### 4.3.3 Requisitos Técnicos

- Instancia de n8n (self-hosted o cloud)
- API keys del CRM configuradas
- Webhooks bidireccionales
- Autenticación segura entre servicios

---

### 4.4 Evolution API - WhatsApp Business

#### 4.4.1 Descripción
Integración con Evolution API para gestionar comunicaciones vía WhatsApp Business.

#### 4.4.2 Funcionalidades

**Gestión de Conexiones:**
- Escaneo de código QR para conectar WhatsApp del agente
- Sincronización con WhatsApp Web
- Gestión de múltiples números de WhatsApp por agente
- Validación de sesiones activas
- Desconexión y reconexión de cuentas

**Mensajería:**
- Envío de mensajes de texto
- Envío de imágenes y documentos
- Envío de mensajes de plantilla (templates)
- Recepción de mensajes de clientes
- Historial completo de conversaciones

**Integración en Deals:**
- Visualización de conversaciones dentro del deal
- Contexto de cliente visible durante chat
- Historial de mensajes asociados al lead
- Notificaciones de nuevos mensajes

#### 4.4.3 Campos de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| ID Conexión | UUID | Identificador de la sesión |
| Número WhatsApp | Teléfono | Número del agente |
| Estado | Selección | Conectado, Desconectado, Esperando QR |
| Fecha Conexión | Fecha/Hora | Cuándo se conectó |
| Último Mensaje | Fecha/Hora | Última actividad |
| Mensajes Totales | Número | Contador de mensajes |

#### 4.4.4 Requisitos Técnicos

- Servidor Evolution API configurado
- Credenciales de API
- Certificado SSL válido
- Webhook para recepción de mensajes
- Almacenamiento seguro de tokens de sesión

---

### 4.5 Twilio - Llamadas y SMS

#### 4.5.1 Descripción
Integración con Twilio para llamadas telefónicas mediante SIP Trunking y envío/recepción de SMS.

#### 4.5.2 Funcionalidades - SIP Trunking para Llamadas

**Características de Llamadas:**
- Llamadas VoIP a través de SIP Trunking
- Identificador de llamada personalizado (Caller ID)
- Grabación de llamadas (con consentimiento)
- Transferencia de llamadas entre agentes
- Estacionamiento de llamadas
- IVR (Interactive Voice Response) básico
- Integración con CRM: visualización de datos del cliente durante llamada

**Registro de Llamadas:**
- Duración de la llamada
- Hora de inicio y fin
- Número marcado/recibido
- Grabación de audio (si aplica)
- Notas post-llamada
- Vinculación automática al lead/deal

#### 4.5.3 Funcionalidades - SMS

**Características de SMS:**
- Envío de SMS a clientes
- Recepción de SMS de clientes
- Respuestas automáticas
- Plantillas de mensajes predefinidas
- Historial de SMS por cliente
- Integración con deals y leads

**Casos de Uso:**
- Confirmación de citas
- Recordatorios de visitas
- Notificaciones de cambios en deals
- Respuestas a consultas rápidas

#### 4.5.4 Requisitos Técnicos

- Cuenta Twilio con SIP Trunking configurado
- Números telefónicos asignados
- Configuración de Caller ID
- Webhook para eventos de llamadas y SMS
- Almacenamiento de grabaciones (S3 o similar)

---

### 4.6 Gmail - Integración de Email

#### 4.6.1 Descripción
Integración con Gmail para gestión centralizada de correos electrónicos.

#### 4.6.2 Funcionalidades

**Sincronización de Emails:**
- Lectura de emails recibidos
- Envío de emails desde el CRM
- Sincronización bidireccional
- Historial de conversaciones por hilo

**Integración en Deals:**
- Visualización de emails dentro del deal
- Contexto del cliente visible al redactar emails
- Plantillas de emails predefinidas
- Seguimiento de emails abiertos (con extensión)

**Gestión de Contactos:**
- Sincronización de contactos con Gmail
- Actualización automática de información
- Sugerencias de contactos frecuentes

#### 4.6.3 Requisitos Técnicos

- Autenticación OAuth 2.0 con Google
- Acceso a Gmail API
- Permisos de lectura/escritura de emails
- Sincronización incremental
- Almacenamiento seguro de tokens

---

### 4.7 Google Calendar - Integración de Calendario

#### 4.7.1 Descripción
Integración con Google Calendar para gestión de citas y eventos.

#### 4.7.2 Funcionalidades

**Gestión de Eventos:**
- Creación de eventos desde el CRM
- Sincronización de eventos del calendario
- Recordatorios automáticos
- Notificaciones de citas próximas
- Vinculación de eventos a leads/deals

**Disponibilidad:**
- Consulta de disponibilidad de agentes
- Bloqueo de horarios no disponibles
- Sugerencias de horarios basadas en disponibilidad

**Integración en Deals:**
- Visualización de citas asociadas al deal
- Historial de reuniones
- Documentación de reuniones (notas, asistentes)

#### 4.7.3 Requisitos Técnicos

- Autenticación OAuth 2.0 con Google
- Acceso a Google Calendar API
- Sincronización bidireccional
- Almacenamiento seguro de tokens

---

## 5. Funcionalidades Transversales

### 5.1 Autenticación y Autorización

#### 5.1.1 Requisitos

- Autenticación con email y contraseña
- Autenticación de dos factores (2FA) opcional
- Recuperación de contraseña segura
- Gestión de sesiones
- Roles y permisos granulares

#### 5.1.2 Roles Predefinidos

| Rol | Permisos |
|-----|----------|
| Administrador | Acceso total, gestión de usuarios, configuración |
| Gerente de Ventas | Gestión de equipo, reportes, configuración de round robin |
| Agente | Acceso a leads/deals asignados, comunicación |
| Supervisor | Monitoreo de equipo, reportes, sin edición |

### 5.2 Dashboard y Reportes

#### 5.2.1 Dashboard Principal

**Widgets Principales:**
- Total de leads activos
- Total de deals en progreso
- Valor total en pipeline
- Leads por fuente
- Distribución de leads por agente
- Deals por etapa
- Tasas de conversión
- Actividad reciente

#### 5.2.2 Reportes Disponibles

- Reporte de leads por fuente
- Reporte de desempeño de agentes
- Reporte de conversión por etapa
- Reporte de valor de deals
- Reporte de tiempo de ciclo de venta
- Reporte de comunicaciones por canal
- Análisis de ROI por campaña

### 5.3 Notificaciones

#### 5.3.1 Tipos de Notificaciones

- Nuevo lead asignado
- Nuevo mensaje de cliente
- Llamada entrante
- Recordatorio de cita
- Deal próximo a vencer
- Escaladas de leads
- Cambios en deals

#### 5.3.2 Canales de Notificación

- Notificaciones en la aplicación (in-app)
- Email
- WhatsApp (mediante Evolution API)
- SMS (mediante Twilio)

### 5.4 Búsqueda y Filtrado Avanzado

#### 5.4.1 Capacidades

- Búsqueda por texto libre
- Filtros por múltiples criterios
- Búsqueda por rango de fechas
- Búsqueda por rango de valores
- Filtros guardados y reutilizables
- Búsqueda global en toda la plataforma

### 5.5 Auditoría y Cumplimiento

#### 5.5.1 Requisitos

- Registro de todas las acciones de usuarios
- Historial de cambios en leads y deals
- Trazabilidad de comunicaciones
- Cumplimiento con regulaciones de privacidad
- Exportación de datos para auditoría
- Retención de registros según políticas

---

## 6. Arquitectura Técnica

### 6.1 Stack Tecnológico Recomendado

#### Backend
- **Lenguaje:** Node.js (Express/NestJS) o Python (FastAPI/Django)
- **Base de Datos:** PostgreSQL (datos transaccionales)
- **Cache:** Redis (sesiones, caché)
- **Message Queue:** RabbitMQ o Kafka (procesamiento asincrónico)
- **Almacenamiento:** AWS S3 o similar (documentos, grabaciones)

#### Frontend
- **Framework:** React.js, Vue.js o Angular
- **UI Library:** Material-UI, Tailwind CSS, o similar
- **State Management:** Redux, Vuex, o Context API
- **Real-time:** WebSockets o Socket.io

#### Infraestructura
- **Hosting:** AWS, Google Cloud, o Azure
- **Containerización:** Docker
- **Orquestación:** Kubernetes (opcional, para escalabilidad)
- **CI/CD:** GitHub Actions, GitLab CI, o Jenkins

### 6.2 Seguridad

#### 6.2.1 Requisitos de Seguridad

- Encriptación de datos en tránsito (TLS 1.2+)
- Encriptación de datos en reposo (AES-256)
- Validación de entrada en todos los endpoints
- Protección contra CSRF, XSS, SQL Injection
- Rate limiting en APIs
- Monitoreo de seguridad y alertas
- Cumplimiento con GDPR, CCPA, y regulaciones locales

#### 6.2.2 Gestión de Credenciales

- Almacenamiento seguro de API keys en variables de entorno
- Rotación periódica de tokens
- Auditoría de acceso a credenciales
- Segregación de credenciales por ambiente (dev, staging, prod)

### 6.3 Escalabilidad

#### 6.3.1 Consideraciones

- Arquitectura de microservicios (opcional)
- Balanceo de carga
- Replicación de base de datos
- CDN para contenido estático
- Caché distribuido
- Auto-scaling basado en carga

### 6.4 Arquitectura Multi-Tenant

#### 6.4.1 Modelo de Multi-Tenancy

Flow Estate CRM implementa un **modelo híbrido de multi-tenancy** que combina:

**Aislamiento de Datos:**
- Datos críticos por tenant en esquemas separados dentro de la misma base de datos PostgreSQL
- Cada tenant tiene su propio schema de base de datos (ej: `tenant_acme`, `tenant_xyz`)
- Tablas de usuarios, leads, deals, comunicaciones completamente aisladas por tenant
- Datos compartidos (configuraciones globales, integraciones maestras) en schema público

**Infraestructura Compartida:**
- Una única instancia de aplicación sirve a múltiples tenants
- Recursos de computación compartidos (servidores, caché, message queues)
- Optimización de costos mediante consolidación de infraestructura

#### 6.4.2 Identificación de Tenants

**Mediante Subdominios:**
```
Formato: {tenant-slug}.flowstate.com
Ejemplos:
- acme-realty.flowstate.com
- xyz-developers.flowstate.com
- panama-properties.flowstate.com
```

**Mediante Parámetro de URL (alternativo):**
```
Formato: flowstate.com/tenant/{tenant-id}
```

**Mediante Header HTTP:**
```
Header: X-Tenant-ID: {tenant-uuid}
Útil para APIs y aplicaciones móviles
```

#### 6.4.3 Estructura de Base de Datos

**Schema Público (Compartido):**
```sql
-- Información de tenants
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255) UNIQUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    status ENUM('active', 'inactive', 'suspended'),
    subscription_plan VARCHAR(50),
    max_users INTEGER,
    max_leads INTEGER,
    max_deals INTEGER
);

-- Usuarios globales (pueden pertenecer a múltiples tenants)
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Relación usuario-tenant
CREATE TABLE public.tenant_users (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID REFERENCES public.users(id),
    role VARCHAR(50), -- admin, manager, agent, supervisor
    created_at TIMESTAMP,
    UNIQUE(tenant_id, user_id)
);

-- Configuración de integraciones maestras
CREATE TABLE public.tenant_integrations (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id),
    integration_type VARCHAR(50), -- meta, google_ads, twilio, etc
    api_key_encrypted VARCHAR(500),
    api_secret_encrypted VARCHAR(500),
    status VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Facturación
CREATE TABLE public.tenant_subscriptions (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id),
    plan_id VARCHAR(50),
    status VARCHAR(20), -- active, past_due, canceled
    current_period_start DATE,
    current_period_end DATE,
    amount_monthly DECIMAL(10, 2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Schema por Tenant (Aislado):**
```sql
-- Dentro del schema tenant_acme:
CREATE SCHEMA tenant_acme;

-- Leads del tenant
CREATE TABLE tenant_acme.leads (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    source VARCHAR(50), -- meta, google_ads, formulario
    status VARCHAR(50),
    assigned_to UUID REFERENCES public.users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id UUID -- Referencia al tenant (redundante pero útil)
);

-- Deals del tenant
CREATE TABLE tenant_acme.deals (
    id UUID PRIMARY KEY,
    lead_id UUID REFERENCES tenant_acme.leads(id),
    stage VARCHAR(50),
    value DECIMAL(15, 2),
    probability INTEGER,
    expected_close_date DATE,
    assigned_to UUID REFERENCES public.users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id UUID
);

-- Comunicaciones del tenant
CREATE TABLE tenant_acme.communications (
    id UUID PRIMARY KEY,
    deal_id UUID REFERENCES tenant_acme.deals(id),
    type VARCHAR(50), -- whatsapp, sms, email, call
    direction VARCHAR(20), -- inbound, outbound
    content TEXT,
    from_user UUID REFERENCES public.users(id),
    from_number VARCHAR(50),
    to_number VARCHAR(50),
    created_at TIMESTAMP,
    tenant_id UUID
);

-- Historial de actividades
CREATE TABLE tenant_acme.activities (
    id UUID PRIMARY KEY,
    deal_id UUID REFERENCES tenant_acme.deals(id),
    activity_type VARCHAR(50),
    description TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP,
    tenant_id UUID
);
```

#### 6.4.4 Aislamiento de Datos y Seguridad

**Row-Level Security (RLS):**
```sql
-- Política RLS para leads
CREATE POLICY tenant_isolation_leads ON tenant_acme.leads
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE tenant_acme.leads ENABLE ROW LEVEL SECURITY;
```

**Validación en Aplicación:**
- Cada request incluye el tenant_id en el contexto
- Todas las queries filtran automáticamente por tenant_id
- Validación en middleware para asegurar que el usuario pertenece al tenant

**Encriptación de Datos Sensibles:**
- API keys de integraciones encriptadas con AES-256
- Números de teléfono encriptados en reposo
- Grabaciones de llamadas encriptadas en almacenamiento

#### 6.4.5 Gestión de Usuarios y Permisos

**Roles por Tenant:**

| Rol | Permisos | Visibilidad de Datos |
|-----|----------|----------------------|
| **Admin Tenant** | Control total del tenant, gestión de usuarios, configuración, facturación | Todos los datos del tenant |
| **Manager** | Gestión de equipo, reportes, configuración de round robin | Datos de su equipo + reportes globales |
| **Agent** | Gestión de leads/deals asignados, comunicación | Solo sus leads y deals asignados |
| **Supervisor** | Monitoreo de equipo, reportes | Datos de su equipo, sin edición |

**Matriz de Permisos:**

| Acción | Admin | Manager | Agent | Supervisor |
|--------|-------|---------|-------|------------|
| Ver todos los leads | ✓ | ✓ (su equipo) | ✓ (asignados) | ✓ (su equipo) |
| Editar lead | ✓ | ✓ (su equipo) | ✓ (asignados) | ✗ |
| Crear deal | ✓ | ✓ | ✓ | ✗ |
| Ver reportes | ✓ | ✓ | ✗ | ✓ |
| Gestionar usuarios | ✓ | ✗ | ✗ | ✗ |
| Configurar integraciones | ✓ | ✗ | ✗ | ✗ |
| Ver facturación | ✓ | ✗ | ✗ | ✗ |

#### 6.4.6 Flujo de Autenticación Multi-Tenant

```
1. Usuario accede a {tenant-slug}.flowstate.com
   ↓
2. Sistema resuelve tenant_id desde el subdominio
   ↓
3. Usuario ingresa credenciales (email + contraseña)
   ↓
4. Sistema verifica que el usuario existe en public.users
   ↓
5. Sistema verifica que el usuario tiene acceso al tenant (tenant_users)
   ↓
6. Sistema genera JWT con claims:
   - user_id
   - tenant_id
   - role
   - permissions
   ↓
7. Token se almacena en cookie segura (HttpOnly, Secure, SameSite)
   ↓
8. Cada request incluye el tenant_id en el contexto
   ↓
9. Middleware valida que el tenant_id del token coincide con el de la URL
   ↓
10. Queries filtran automáticamente por tenant_id
```

#### 6.4.7 Aislamiento de Integraciones

**Credenciales por Tenant:**
- Cada tenant tiene sus propias credenciales de Meta Ads, Google Ads, Twilio, etc.
- Las credenciales se almacenan encriptadas en `public.tenant_integrations`
- Webhooks incluyen tenant_id para enrutar datos correctamente

**Ejemplo de Webhook de Meta Ads:**
```
POST /webhooks/meta/{tenant_id}
Body: {
    "lead_id": "...",
    "name": "...",
    "email": "...",
    "phone": "..."
}

Sistema:
1. Valida que el tenant_id existe
2. Obtiene credenciales del tenant
3. Valida el webhook signature
4. Inserta el lead en tenant_{slug}.leads
5. Dispara automatización de n8n para ese tenant
```

#### 6.4.8 Facturación y Gestión de Suscripciones

**Planes de Suscripción:**

| Plan | Usuarios | Leads/Mes | Deals | Integraciones | Precio |
|------|----------|-----------|-------|---------------|--------|
| **Starter** | 3 | 500 | 50 | Meta, Google Ads | $99/mes |
| **Professional** | 10 | 5,000 | 500 | Todos excepto Twilio | $299/mes |
| **Enterprise** | Ilimitado | Ilimitado | Ilimitado | Todos | Personalizado |

**Gestión de Límites:**
```
-- Validación en aplicación
IF tenant.max_leads_monthly < leads_created_this_month THEN
    RAISE ERROR "Límite de leads alcanzado"
END IF;

IF tenant.max_users < active_users THEN
    RAISE ERROR "Límite de usuarios alcanzado"
END IF;
```

**Integración con Stripe:**
- Crear customer en Stripe por tenant
- Webhook de Stripe para cambios de suscripción
- Actualizar estado en `public.tenant_subscriptions`
- Suspender acceso si suscripción vence

#### 6.4.9 Aislamiento de Comunicaciones

**WhatsApp (Evolution API):**
- Cada tenant puede conectar múltiples números de WhatsApp
- Tabla `tenant_acme.whatsapp_connections` almacena sesiones
- Mensajes se almacenan en `tenant_acme.communications`
- QR se genera por tenant

**Twilio:**
- Cada tenant tiene su propia cuenta de Twilio o números asignados
- Webhooks de Twilio incluyen tenant_id
- Grabaciones se almacenan en bucket S3 por tenant

**Gmail:**
- Cada usuario conecta su propia cuenta de Gmail
- Tokens OAuth se almacenan encriptados por usuario
- Emails se sincronizan al schema del tenant

#### 6.4.10 Monitoreo y Auditoría Multi-Tenant

**Tabla de Auditoría:**
```sql
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID REFERENCES public.users(id),
    action VARCHAR(100),
    resource_type VARCHAR(50), -- lead, deal, user, etc
    resource_id UUID,
    changes JSONB, -- antes y después
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP
);

CREATE INDEX idx_audit_tenant ON public.audit_log(tenant_id, created_at DESC);
```

**Monitoreo:**
- Dashboard de uso por tenant (leads, deals, usuarios activos)
- Alertas si un tenant excede límites
- Logs de errores segregados por tenant
- Métricas de performance por tenant

#### 6.4.11 Consideraciones de Performance

**Índices Críticos:**
```sql
-- En cada schema de tenant
CREATE INDEX idx_leads_tenant_assigned ON tenant_acme.leads(assigned_to, created_at DESC);
CREATE INDEX idx_deals_tenant_stage ON tenant_acme.deals(stage, updated_at DESC);
CREATE INDEX idx_communications_deal ON tenant_acme.communications(deal_id, created_at DESC);

-- En schema público
CREATE INDEX idx_tenant_users_tenant ON public.tenant_users(tenant_id);
CREATE INDEX idx_integrations_tenant ON public.tenant_integrations(tenant_id);
```

**Caché por Tenant:**
- Redis keys incluyen tenant_id: `tenant:{tenant_id}:leads:{lead_id}`
- Invalidación de caché cuando datos cambian
- TTL de 5 minutos para datos no críticos

**Particionamiento (opcional):**
- Si el volumen crece, particionar tablas por tenant_id
- Mejora performance en queries grandes

#### 6.4.12 Disaster Recovery y Backup

**Backups:**
- Backup completo diario de toda la base de datos
- Backups incrementales cada 6 horas
- Retención de 30 días
- Posibilidad de restore a nivel de tenant

**Recuperación:**
- RTO (Recovery Time Objective): 1 hora
- RPO (Recovery Point Objective): 6 horas
- Procedimiento documentado para restore de tenant específico

---

## 7. Consideraciones Multi-Tenant en Integraciones

### 7.1 Flujo de Datos Multi-Tenant

**Ejemplo: Captura de Lead desde Meta Ads**

```
1. Meta Ads dispara webhook a /webhooks/meta/{tenant_id}
   ↓
2. Sistema valida tenant_id y firma del webhook
   ↓
3. Obtiene credenciales de Meta para el tenant
   ↓
4. Mapea campos de Meta al schema del tenant
   ↓
5. Inserta en tenant_{slug}.leads
   ↓
6. Dispara flujo de n8n para ese tenant
   ↓
7. Round robin asigna a agente del mismo tenant
   ↓
8. Notificación enviada al agente (WhatsApp, Email, SMS)
   ↓
9. Auditoría registrada en public.audit_log
```

### 7.2 Validación de Tenant en Integraciones

**Middleware de Validación:**
```javascript
// Middleware Express
const validateTenant = (req, res, next) => {
    // Obtener tenant_id desde subdominio
    const subdomain = req.hostname.split('.')[0];
    const tenant = getTenantBySubdomain(subdomain);
    
    if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Validar que el usuario pertenece al tenant
    const userId = req.user.id;
    const userTenant = getUserTenant(userId, tenant.id);
    
    if (!userTenant) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    // Establecer tenant en contexto
    req.tenant = tenant;
    req.userRole = userTenant.role;
    
    next();
};
```

## 8. Integraciones de Datos

### 7.1 Mapeo de Campos

#### Meta Ads → CRM

| Meta Field | CRM Field | Transformación |
|-----------|-----------|-----------------|
| first_name | nombre | Texto directo |
| last_name | apellido | Texto directo |
| phone_number | teléfono | Normalizar formato |
| email | email | Validar y normalizar |
| city | ciudad | Texto directo |
| state | estado | Mapeo de códigos |
| zip_code | código_postal | Texto directo |

#### Google Ads → CRM

| Google Field | CRM Field | Transformación |
|-------------|-----------|-----------------|
| First Name | nombre | Texto directo |
| Last Name | apellido | Texto directo |
| Phone | teléfono | Normalizar formato |
| Email | email | Validar y normalizar |
| Address | dirección | Texto directo |

### 7.2 Sincronización de Datos

- **Frecuencia:** Tiempo real para leads, cada 5 minutos para datos de deals
- **Conflictos:** Última escritura gana (LWW)
- **Validación:** Esquema JSON para cada integración
- **Rollback:** Capacidad de revertir cambios en últimas 24 horas

---

## 8. Casos de Uso Principales

### 8.1 Caso de Uso 1: Captura y Asignación de Lead

**Actor:** Cliente potencial, Sistema de Publicidad, Agente Inmobiliario

**Flujo:**
1. Cliente completa formulario en Meta Ads o Google Ads
2. Sistema captura automáticamente los datos
3. Algoritmo de round robin asigna el lead a un agente disponible
4. Agente recibe notificación (email, WhatsApp, SMS)
5. Agente visualiza información del lead en su dashboard
6. Agente inicia comunicación mediante WhatsApp o llamada

### 8.2 Caso de Uso 2: Gestión de Deal

**Actor:** Agente Inmobiliario, Gerente de Ventas

**Flujo:**
1. Agente convierte lead calificado a deal
2. Agente vincula propiedad inmobiliaria al deal
3. Agente registra todas las interacciones (llamadas, mensajes, emails)
4. Gerente monitorea progreso del deal en dashboard
5. Sistema genera recordatorios automáticos
6. Al cerrar el deal, se registra la transacción

### 8.3 Caso de Uso 3: Comunicación Multicanal

**Actor:** Agente Inmobiliario, Cliente

**Flujo:**
1. Agente inicia conversación por WhatsApp (mediante QR)
2. Mensajes se registran automáticamente en el deal
3. Cliente responde por SMS
4. Agente recibe notificación y responde
5. Agente puede escalar a llamada de voz
6. Toda la comunicación queda documentada

### 8.4 Caso de Uso 4: Automatización de Seguimiento

**Actor:** Sistema (n8n), Agente Inmobiliario

**Flujo:**
1. Lead sin interacción por 7 días dispara automatización
2. Sistema envía recordatorio al agente
3. Si no hay respuesta en 3 días, lead se reasigna
4. Sistema registra escalada en log
5. Nuevo agente recibe notificación y contexto completo

---

## 9. Requisitos No Funcionales

### 9.1 Rendimiento

- Tiempo de carga de página: < 3 segundos
- Tiempo de respuesta de API: < 500ms (p95)
- Disponibilidad: 99.5% uptime
- Capacidad: Mínimo 10,000 leads activos, 1,000 deals concurrentes

### 9.2 Usabilidad

- Interfaz intuitiva y responsiva
- Accesibilidad WCAG 2.1 AA
- Soporte multiidioma (español, inglés como mínimo)
- Documentación de usuario completa
- Capacitación para usuarios

### 9.3 Mantenibilidad

- Código bien documentado
- Tests unitarios y de integración
- Logging centralizado
- Monitoreo y alertas
- Plan de disaster recovery

### 9.4 Compatibilidad

- Navegadores: Chrome, Firefox, Safari, Edge (versiones recientes)
- Dispositivos: Desktop, tablet, mobile
- APIs: RESTful con documentación OpenAPI/Swagger

---

## 10. Fases de Implementación

### Fase 1: MVP (Meses 1-2)
- Módulo de leads (captura básica)
- Módulo de deals (gestión básica)
- Round robin simple
- Integración Meta Ads
- Integración Gmail
- Autenticación básica

### Fase 2: Comunicación (Meses 3-4)
- Integración Evolution API (WhatsApp)
- Integración Twilio (SMS y llamadas)
- Historial de comunicaciones en deals
- Notificaciones multicanal

### Fase 3: Automatización (Meses 5-6)
- Integración n8n
- Flujos de automatización principales
- Integración Google Ads
- Integración Google Calendar

### Fase 4: Optimización (Meses 7+)
- Reportes avanzados
- Análisis y BI
- Optimizaciones de rendimiento
- Mejoras basadas en feedback

---

## 11. Criterios de Aceptación

### 11.1 Funcionales

- [ ] Sistema captura 100% de leads desde Meta Ads
- [ ] Sistema captura 100% de leads desde Google Ads
- [ ] Round robin distribuye leads equitativamente
- [ ] Agentes pueden conectar WhatsApp mediante QR
- [ ] Historial de mensajes visible en deals
- [ ] Llamadas VoIP funcionan sin latencia significativa
- [ ] SMS enviados y recibidos correctamente
- [ ] Emails sincronizados con Gmail
- [ ] Eventos de calendario sincronizados
- [ ] Automatizaciones de n8n ejecutadas correctamente

### 11.2 No Funcionales

- [ ] Sistema soporta 1,000+ usuarios concurrentes
- [ ] Tiempo de carga < 3 segundos
- [ ] API responde en < 500ms (p95)
- [ ] 99.5% uptime en producción
- [ ] Datos encriptados en tránsito y en reposo
- [ ] Auditoría completa de acciones
- [ ] Cumplimiento GDPR/CCPA

### 11.3 Multi-Tenant

- [ ] Cada tenant tiene su propio schema de base de datos
- [ ] Aislamiento completo de datos entre tenants
- [ ] Subdominios personalizados funcionan correctamente
- [ ] Usuarios solo ven datos de su tenant asignado
- [ ] Admins pueden ver todos los datos de su tenant
- [ ] Agentes solo ven sus leads y deals asignados
- [ ] Integraciones funcionan correctamente por tenant
- [ ] Facturación segregada por tenant
- [ ] Webhooks enrutan correctamente por tenant_id
- [ ] Auditoría registra tenant_id en cada acción

---

## 12. Glosario

| Término | Definición |
|---------|-----------|
| **Lead** | Cliente potencial capturado de fuentes de publicidad o formularios |
| **Deal** | Oportunidad de venta asociada a uno o más leads |
| **Round Robin** | Algoritmo de distribución equitativa de leads entre agentes |
| **SIP Trunking** | Servicio de telefonía VoIP para llamadas de voz |
| **Webhook** | Endpoint que recibe datos en tiempo real de servicios externos |
| **Evolution API** | Plataforma para integración con WhatsApp Business |
| **n8n** | Herramienta de automatización de flujos de trabajo |
| **QR Code** | Código de respuesta rápida para conectar WhatsApp |
| **IVR** | Sistema de respuesta interactiva de voz |
| **Caller ID** | Identificador de llamada personalizado |
| **Multi-Tenant** | Arquitectura donde múltiples clientes (tenants) comparten la misma infraestructura con datos aislados |
| **Tenant** | Organización o agencia inmobiliaria que usa la plataforma |
| **Schema** | Estructura de base de datos que contiene tablas y relaciones |
| **Row-Level Security (RLS)** | Mecanismo de base de datos para aislar datos a nivel de fila |
| **Subdominio** | Parte de una URL que identifica al tenant (ej: acme.flowstate.com) |

---

## 13. Aprobaciones

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|------|
| Product Manager | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Tech Lead | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Stakeholder | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |

---

## 14. Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | Feb 2026 | Flow Estate | Documento inicial |

---

**Fin del Documento**
