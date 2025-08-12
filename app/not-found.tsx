import Link from "next/link";
import "./globals.css";

export default function NotFound() {
    return (
        <html lang="es">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>404 - Página no encontrada | Debt Detox</title>
            </head>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-base-100">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">
                            404 - Página no encontrada
                        </h1>
                        <p className="text-lg mb-6">
                            Lo sentimos, la página que buscas no existe.
                        </p>
                        <Link href="/" className="btn btn-primary">
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
