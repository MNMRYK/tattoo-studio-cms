// Usamos una URL directa para que el navegador no se pierda
import { createClient } from 'https://esm.sh/@sanity/client@6.15.2';

export const client = createClient({
    projectId: 'e5uknfkl', 
    dataset: 'production',
    useCdn: false, 
    apiVersion: '2024-03-04',
});