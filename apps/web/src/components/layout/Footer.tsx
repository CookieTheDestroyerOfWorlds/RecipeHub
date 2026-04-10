export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} RecipeHub. Share food, share love.
        </p>
      </div>
    </footer>
  );
}
