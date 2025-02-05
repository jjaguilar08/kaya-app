export default function ApplicationLogo({ className }) {
    return (
        <img
            src="/images/logo.png"
            alt="Kaya App Logo"
            className={`w-48 h-auto ${className}`} // Adjust width, maintain aspect ratio
        />
    );
}
