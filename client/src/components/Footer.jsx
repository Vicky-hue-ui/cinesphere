const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 text-center py-6 mt-10">
      <p className="text-sm">
        © {new Date().getFullYear()} <span className="text-yellow-400 font-semibold">Moviefy</span>. 
        Powered by{' '}
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-400 hover:underline"
        >
          TMDB API
        </a>
        .
      </p>
    </footer>
  );
};

export default Footer;

