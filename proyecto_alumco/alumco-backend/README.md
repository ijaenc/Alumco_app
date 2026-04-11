# Alumco Backend API — Supabase

Backend para la aplicación de capacitaciones Alumco. Usa **Node.js + Express + TypeScript + PostgreSQL (Supabase)**.

---

## 🛠️ Instalación

### 1. Instala dependencias
```bash
npm install
```

### 2. Crea el archivo `.env`
```
New-Item .env      # PowerShell
```
Pega este contenido en el archivo `.env`:

```env
PORT=3000
JWT_SECRET=alumco_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://postgres:AlumcoApp_2026!@db.ziiuixtsttufkhtlkhhx.supabase.co:5432/postgres
FRONTEND_URL=http://localhost:5173
MAX_ATTEMPTS=2
WAIT_PERIOD_DAYS=14
PASSING_SCORE=70
```

### 3. Crea las tablas y carga datos de prueba
```bash
npm run seed
```

### 4. Inicia el servidor
```bash
npm run dev
```

El servidor corre en **http://localhost:3000**

---

## 👤 Credenciales de prueba

| Rol        | Email                      | Contraseña   |
|------------|----------------------------|--------------|
| Admin      | admin@alumco.org           | password123  |
| Profesor   | juan.perez@alumco.org      | password123  |
| Profesora  | maria.gonzalez@alumco.org  | password123  |
| Estudiante | carlos@alumco.org          | password123  |
| Estudiante | ana@alumco.org             | password123  |
| Estudiante | luis@alumco.org            | password123  |

---

## 🗄️ Base de datos

Las tablas se crean automáticamente en Supabase al correr `npm run seed` o `npm run dev`.
Puedes verlas en el dashboard de Supabase → **Table Editor**.

---

## 📡 API — Base URL: `http://localhost:3000/api`

### Auth
| Método | Ruta           | Descripción                  |
|--------|----------------|------------------------------|
| POST   | /auth/login    | Iniciar sesión → token JWT   |
| POST   | /auth/register | Registrar nuevo usuario      |
| GET    | /auth/me       | Perfil del usuario actual 🔒 |
| PUT    | /auth/me       | Actualizar perfil 🔒         |

### Cursos
| Método | Ruta                                        | Roles           |
|--------|---------------------------------------------|-----------------|
| GET    | /courses                                    | Todos 🔒        |
| GET    | /courses/:id                                | Todos 🔒        |
| POST   | /courses                                    | Teacher, Admin  |
| PUT    | /courses/:id                                | Teacher, Admin  |
| DELETE | /courses/:id                                | Teacher, Admin  |
| POST   | /courses/:id/modules                        | Teacher, Admin  |
| PUT    | /courses/:id/modules/:moduleId              | Teacher, Admin  |
| DELETE | /courses/:id/modules/:moduleId              | Teacher, Admin  |
| POST   | /courses/:id/enroll                         | Teacher, Admin  |
| DELETE | /courses/:id/enroll/:studentId              | Teacher, Admin  |
| POST   | /courses/:id/modules/:moduleId/complete     | Student         |

### Evaluaciones
| Método | Ruta                                    | Roles          |
|--------|-----------------------------------------|----------------|
| GET    | /evaluations/:id                        | Todos 🔒       |
| POST   | /evaluations                            | Teacher, Admin |
| PUT    | /evaluations/:id                        | Teacher, Admin |
| POST   | /evaluations/:id/submit                 | Student        |
| GET    | /evaluations/:id/attempts               | Teacher, Admin |
| GET    | /evaluations/:id/my-attempts            | Student        |
| DELETE | /evaluations/:id/attempts/:studentId    | Admin          |

### Certificados
| Método | Ruta                      | Roles          |
|--------|---------------------------|----------------|
| GET    | /certificates             | Todos 🔒       |
| GET    | /certificates/:id         | Todos 🔒       |
| POST   | /certificates/:id/revoke  | Admin          |
| GET    | /verify/:certNumber       | Público 🌐     |

### Mensajes
| Método | Ruta                         | Descripción              |
|--------|------------------------------|--------------------------|
| GET    | /messages/conversations      | Lista de conversaciones  |
| GET    | /messages/:peerId            | Historial de mensajes    |
| POST   | /messages                    | Enviar mensaje           |
| GET    | /messages/unread-count       | Mensajes no leídos       |
| GET    | /messages/users              | Usuarios disponibles     |

### Admin
| Método | Ruta                            | Descripción                     |
|--------|---------------------------------|---------------------------------|
| GET    | /admin/stats                    | Estadísticas globales           |
| GET    | /admin/courses/stats            | Estadísticas por curso          |
| GET    | /admin/evaluation-stats         | Estadísticas por evaluación     |
| GET    | /admin/students                 | Lista de estudiantes            |
| GET    | /admin/students/:id/progress    | Progreso detallado de estudiante|
| GET    | /admin/users                    | Todos los usuarios              |
| POST   | /admin/users                    | Crear usuario                   |
| PATCH  | /admin/users/:id/status         | Activar/desactivar usuario      |

---

## 🔗 Integración con el Frontend React

Crea `src/app/services/api.ts`:

```typescript
const BASE_URL = 'http://localhost:3000/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error del servidor' }));
    throw new Error(error.error || 'Error del servidor');
  }
  return res.json();
}
```

---

## 🚀 Scripts
```bash
npm run dev     # Desarrollo con hot-reload
npm run build   # Compilar TypeScript
npm run start   # Ejecutar versión compilada
npm run seed    # Poblar Supabase con datos de prueba
```
