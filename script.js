// 1. Configuración
const projectId = 'e5uknfkl';
const dataset = 'production';

// 2. Observador (Solo para animar lo que entra en pantalla)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Si usas 'obs' para dejar de observar, cámbialo por 'observer'
            observer.unobserve(entry.target); 
        }
    });
}, { threshold: 0.1 });

// Aplicar a todos los elementos con clase reveal
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// 3. Función Principal
async function inicializarWeb() {
    console.log("Inicializando web...");

    // A. Activar animaciones para elementos que YA están en el HTML
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // B. Cargar contenido dinámico de Sanity
    await cargarContenido();
}

    // 2. LÓGICA UNIFICADA DE SANITY (Tatuajes + Eventos)
async function cargarContenido() {
    // --- Carga de Tatuajes ---
    const urlTatuajes = `https://${projectId}.api.sanity.io/v2023-05-03/data/query/${dataset}?query=${encodeURIComponent('*[_type == "tatuaje"]{titulo, "urlImagen": imagen.asset->url}')}`;
    // --- Carga de Eventos ---
    const urlEventos = `https://${projectId}.api.sanity.io/v2023-05-03/data/query/${dataset}?query=${encodeURIComponent('*[_type == "eventos"] | order(_createdAt desc)[0]{titulo, descripcion, fecha, "urlImagen": imagen.asset->url}')}`;

    try {
        // Traer ambos a la vez
        const [resTats, resEvs] = await Promise.all([fetch(urlTatuajes), fetch(urlEventos)]);
        const dataTats = await resTats.json();
        // --- CORRECCIÓN AQUÍ: Cambiamos res.json() por resEvs.json() ---
        const dataEvs = await resEvs.json(); 

        // Pintar Tatuajes
        const contTats = document.getElementById('sanity-medida');
        if (contTats && dataTats.result) {
            dataTats.result.forEach(tatto => {
                // Quitamos la clase "active" del string para que la ponga el observer al hacer scroll
                const html = `
                    <article class="tarjeta-medida reveal">
                        <div class="foto-medida">
                            <img src="${tatto.urlImagen}" alt="${tatto.titulo}">
                        </div>
                        <div class="info-tarjeta">
                            <h3>${tatto.titulo}</h3>
                        </div>
                    </article>`;
                contTats.insertAdjacentHTML('beforeend', html);

                // IMPORTANTE: Le decimos al observador que mire el nuevo tatuaje
                observer.observe(contTats.lastElementChild);
            });
        }

        // --- Pintar Eventos ---
        const contEvs = document.getElementById('sanity-eventos-container');
        const evento = dataEvs.result;
        if (contEvs && evento) {
            contEvs.innerHTML = `
                <div class="columna-img-eventos reveal">
                    <img src="${evento.urlImagen}" alt="${evento.titulo}">
                </div>
                <div class="columna-info-eventos reveal">
                    <h2>${evento.titulo}</h2>
                    <p>${evento.descripcion}</p>
                    <p><strong>${evento.fecha}</strong></p>
                </div>`;
            
            // Decimos al observador que mire los nuevos elementos de eventos
            contEvs.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        }
    } catch (e) { 
        console.error("Error cargando datos:", e); 
    }
}

// 4. Ejecución
document.addEventListener('DOMContentLoaded', () => {
    inicializarWeb();

    // B. Menú Móvil (lo que tenías antes)
    const mobileMenu = document.getElementById('mobile-menu');
    const navList = document.querySelector('.nav-list');
    
    if (mobileMenu && navList) {
        mobileMenu.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }

    // C. Si tienes otros scripts de animaciones, inícialos aquí
    console.log("Web cargada y observadores listos.");
});

