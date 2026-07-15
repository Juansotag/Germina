# Germina

## Estructura del proyecto

```
Germina/
├── frontend/          # React + Vite (puerto 5173 en desarrollo)
│   ├── src/
│   │   ├── app/       # Páginas y rutas
│   │   ├── components/# Componentes reutilizables
│   │   ├── assets/    # Imágenes y branding
│   │   ├── styles/    # CSS global y design system
│   │   └── lib/       # Utilidades y helpers
│   └── public/        # Archivos estáticos (fuentes, etc.)
│
└── backend/           # Node + Express (puerto 3001 en desarrollo)
    └── src/
        ├── routes/    # Rutas de la API
        ├── services/  # Lógica de negocio
        ├── db/        # Migrations y queries
        ├── llm/       # Integración con el LLM
        └── config/    # Configuración
```

## Correr en desarrollo

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
cp .env.example .env   # rellenar variables reales
npm run dev
```

## Stack

- **Frontend:** React 18 + Vite 5 + React Router 6
- **Backend:** Node.js + Express
- **Auth:** Supabase Auth (solo @unisabana.edu.co)
- **Base de datos:** PostgreSQL en Railway
- **Archivos:** Cloudflare R2
- **LLM:** Claude (Anthropic)
- **Voz:** Whisper (OpenAI)
