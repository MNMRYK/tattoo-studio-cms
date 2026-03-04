import { client } from './config-sanity.js';

// 1. El observer para las animaciones
const observerOptions = { threshold: 0.15 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// 2. Función para cargar Tatuajes
async function cargarTatuajes() {
    try {
        const query = `*[_type == "tatuaje"]{
            titulo,
            "urlImagen": imagen.asset->url,
            estilo
        }`;

        const tatuajes = await client.fetch(query);
        console.log("✅ Tatuajes recibidos:", tatuajes);

        const contenedores = {
            "A medida": document.getElementById('sanity-medida'),
            "Fine Line": document.getElementById('sanity-fineline'),
            "fine-line": document.getElementById('sanity-fineline'),
            "Inspirate": document.getElementById('sanity-inspirate')
        };

        tatuajes.forEach(tatto => {
            if (!tatto.estilo || !tatto.urlImagen) return;

            const destino = contenedores[tatto.estilo];
            if (destino) {
                const article = document.createElement('article');
                article.className = (tatto.estilo === 'A medida') ? 'tarjeta-medida reveal' : 'tarjeta-fineline reveal';

                article.innerHTML = `
                    <div class="${tatto.estilo === 'A medida' ? 'foto-medida' : 'foto-fineline'}">
                        <img src="${tatto.urlImagen}" alt="${tatto.titulo || 'Tatuaje'}">
                    </div>
                    ${tatto.estilo === 'A medida' ? `
                    <div class="info-tarjeta">
                        <h3>${tatto.titulo}</h3>
                        <p>${tatto.estilo}</p>
                    </div>` : ''}
                `;

                destino.appendChild(article);
                observer.observe(article);
            }
        });

        // Animamos las que ya están en el HTML
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    } catch (error) {
        console.error("❌ Error en cargarTatuajes:", error);
    }
}

// 3. Función para cargar Eventos
async function cargarEventos() {
    try {
        const query = `*[_type == "eventos"] | order(_createdAt desc)[0]{
            titulo,
            descripcion,
            fecha,
            "urlImagen": imagen.asset->url
        }`;

        const evento = await client.fetch(query);
        console.log("📢 ¿Qué trae Sanity?:", evento);
        const contenedor = document.getElementById('sanity-eventos-container');

        if (evento && contenedor) {
            contenedor.innerHTML = `
                <div class="columna-img-eventos">
                    <img src="${evento.urlImagen}" class="reveal" alt="${evento.titulo}">
                </div>
                <div class="columna-info-eventos">
                    <h2 class="reveal">${evento.titulo}</h2>
                    <p class="reveal">${evento.descripcion}</p>
                    <p class="reveal"><strong>${evento.fecha}</strong></p>
                    <div class="contenedor-boton">
                         <a href="https://wa.me/tu-numero" class="boton-guia">RESERVAR CITA</a>
                    </div>
                </div>
            `;
            contenedor.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        }
    } catch (error) {
        console.error("❌ Error cargando eventos:", error);
    }
}

// 4. Al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarTatuajes();
    cargarEventos();

    // Menú Mobile
    const mobileMenu = document.getElementById('mobile-menu');
    const navList = document.querySelector('.nav-list');
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navList.classList.toggle('active');
            const icon = mobileMenu.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
});