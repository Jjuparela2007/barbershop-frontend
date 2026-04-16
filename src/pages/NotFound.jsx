import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center px-6 relative animate-fade-in">
      
      {/* Fondo noise */}
      <div className="noise-overlay"></div>

      <div className="text-center max-w-2xl w-full animate-fade-up">

        {/* Label */}
        <p className="section-label mb-4">Error de navegación</p>

        {/* Línea dorada */}
        <div className="gold-line mx-auto mb-6"></div>

        {/* 404 con shimmer */}
        <h1 className="text-7xl md:text-8xl font-bold gold-shimmer mb-6">
          404
        </h1>

        {/* Título elegante */}
        <h2 
          className="text-2xl md:text-3xl mb-4"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Página no encontrada
        </h2>

        {/* Texto */}
        <p className="text-[var(--white-muted)] mb-10">
          La página que intentas acceder no existe o fue movida dentro del sistema.
        </p>

        {/* Botones */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate("/")}
            className="btn-gold"
          >
            Volver al inicio
          </button>

          
        </div>

      </div>
    </section>
  );
}