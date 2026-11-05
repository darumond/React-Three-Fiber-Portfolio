export const Menu = (props) => {
    const { onSectionChange, menuOpened, setMenuOpened } = props;
    const navigate = (section) => {
      onSectionChange(section);
      setMenuOpened(false);
    };
  
    return (
      <>
        <button
          aria-label={menuOpened ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpened}
          aria-controls="portfolio-navigation"
          onClick={() => setMenuOpened(!menuOpened)}
          className="z-20 fixed top-4 right-4 md:top-12 md:right-12 p-3 bg-purple-light w-11 h-11 rounded-md"
        >
          <div
            className={`bg-white h-0.5 rounded-md w-full transition-all ${
              menuOpened ? "rotate-45  translate-y-0.5" : ""
            }`}
          />
          <div
            className={`bg-white h-0.5 rounded-md w-full my-1 ${
              menuOpened ? "hidden" : ""
            }`}
          />
          <div
            className={`bg-white h-0.5 rounded-md w-full transition-all ${
              menuOpened ? "-rotate-45" : ""
            }`}
          />
        </button>
        <div
          id="portfolio-navigation"
          aria-hidden={!menuOpened}
          inert={menuOpened ? undefined : ""}
          className={`z-10 fixed top-0 right-0 bottom-0 bg-white transition-all overflow-hidden flex flex-col
        ${menuOpened ? "w-full md:w-80" : "w-0"}`}
        >
          <div className="flex-1 flex items-start justify-center flex-col gap-6 p-8">
            <MenuButton label="About" onClick={() => navigate(0)} />
            <MenuButton label="Piano" onClick={() => navigate(1)} />
            <MenuButton label="Projects" onClick={() => navigate(2)} />
          </div>
        </div>
      </>
    );
  };
  
  const MenuButton = (props) => {
    const { label, onClick } = props;
    return (
      <button
        onClick={onClick}
        className="text-2xl font-bold cursor-pointer hover:text-indigo-600 transition-colors"
      >
        {label}
      </button>
    );
  };
