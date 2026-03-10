// 1. Configuración
const projectId = 'e5uknfkl';
const dataset = 'production';

// 2. Observador (Solo para animar lo que entra en pantalla)
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

async function inicializarWeb() {
    console.log("Inicializando web y cargando Sanity...");

    // 1. FORZAR VISIBILIDAD DE LO ESTÁTICO
    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('active'); 
    });

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
                    const html = `<article class="tarjeta-medida reveal active"><div class="foto-medida"><img src="${tatto.urlImagen}" alt="${tatto.titulo}"></div><div class="info-tarjeta"><h3>${tatto.titulo}</h3></div></article>`;
                    contTats.insertAdjacentHTML('beforeend', html);
                });
            }

            // Pintar Eventos
            const contEvs = document.getElementById('sanity-eventos-container');
            const evento = dataEvs.result;

            if (contEvs && evento) {
                contEvs.innerHTML = ''; // Limpiamos contenido previo

                // Ya no añadimos "contenedor-eventos", 
                // porque el padre (#sanity-eventos-container) YA tiene esa clase.
                const htmlEv = `
                    <div class="columna-img-eventos">
                        <img src="${evento.urlImagen}" alt="${evento.titulo}">
                    </div>
                    <div class="columna-info-eventos">
                        <h2>${evento.titulo}</h2>
                        <p>${evento.descripcion}</p>
                        <p><strong>${evento.fecha}</strong></p>
                    </div>`;
                
                contEvs.insertAdjacentHTML('beforeend', htmlEv);
            }
        } catch (e) { console.error("Error cargando datos:", e); }
    }

    cargarContenido();
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
    console.log("Web cargada completamente");
});