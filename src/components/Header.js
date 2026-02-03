import Navbar from "./Navbar";

export default function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Navbar />
      </div>
    </header>
  );
}
