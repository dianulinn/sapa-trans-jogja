export default function BottomNavbar({ activeTab, handleNavigation }) {

    const icons = {
        home: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                    d="M20.83 8.01002L14.28 2.77002C13 1.75002 11 1.74002 9.72999 2.76002L3.17999 8.01002C2.23999 8.76002 1.66999 10.26 1.86999 11.44L3.12999 18.98C3.41999 20.67 4.98999 22 6.69999 22H17.3C18.99 22 20.59 20.64 20.88 18.97L22.14 11.43C22.32 10.26 21.75 8.76002 20.83 8.01002ZM12.75 18C12.75 18.41 12.41 18.75 12 18.75C11.59 18.75 11.25 18.41 11.25 18V15C11.25 14.59 11.59 14.25 12 14.25C12.41 14.25 12.75 14.59 12.75 15V18Z"
                    fill="currentColor"
                />
            </svg>
        ),

        chat: (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M17.98 10.79V14.79C17.98 15.05 17.97 15.3 17.94 15.54C17.71 18.24 16.12 19.58 13.19 19.58H12.79C12.54 19.58 12.3 19.7 12.15 19.9L10.95 21.5C10.42 22.21 9.56 22.21 9.03 21.5L7.82999 19.9C7.69999 19.73 7.41 19.58 7.19 19.58H6.79001C3.60001 19.58 2 18.79 2 14.79V10.79C2 7.86001 3.35001 6.27001 6.04001 6.04001C6.28001 6.01001 6.53001 6 6.79001 6H13.19C16.38 6 17.98 7.60001 17.98 10.79Z"
                    fill="currentColor"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <path
                    d="M21.98 6.79001V10.79C21.98 13.73 20.63 15.31 17.94 15.54C17.97 15.3 17.98 15.05 17.98 14.79V10.79C17.98 7.60001 16.38 6 13.19 6H6.79004C6.53004 6 6.28004 6.01001 6.04004 6.04001C6.27004 3.35001 7.86004 2 10.79 2H17.19C20.38 2 21.98 3.60001 21.98 6.79001Z"
                    fill="currentColor"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <path
                    d="M13.4955 13.25H13.5045"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                <path
                    d="M9.9955 13.25H10.0045"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                <path
                    d="M6.4955 13.25H6.5045"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        ),

        map: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                    d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />

                <path
                    d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                    fill="white"
                    stroke="white"
                    strokeWidth="1.5"
                />
            </svg>
        ),
    };

    const menuItems = [
        { id: "home", label: "Home" },
        { id: "chat", label: "AI Chat" },
        { id: "map", label: "Map" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 z-50 flex h-[76px] w-full items-center justify-center border-t border-gray-100 bg-white px-2 pb-2 pt-1 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">

            <div className="flex w-full max-w-[600px] justify-around">

                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNavigation(item.id)}
                            className={`flex w-16 flex-col items-center justify-center gap-1.5 transition-colors ${isActive
                                    ? "text-[#0063F3]"
                                    : "text-[#B3B3B3] hover:text-[#767373]"
                                }`}
                        >

                            {/* ICON */}
                            {icons[item.id]}

                            {/* LABEL */}
                            <span
                                className={`font-['Inter'] text-[10px] leading-[100%] ${isActive
                                    ? "font-semibold"
                                    : "font-medium"
                                    }`}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}