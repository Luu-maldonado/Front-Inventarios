// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-200 text-center p-4 mt-8">
      <p className="text-sm">&copy; {new Date().getFullYear()} IAtomica. Todos los derechos reservados.</p>
    </footer>
  )
}
