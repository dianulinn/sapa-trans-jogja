import { useEffect, useRef, useState } from "react";
import "@fontsource/rubik/500.css";
import MapComponent from "../components/Map/MapComponent";

const getAksesibilitasColor = (kelas) => {
    switch (kelas) {
        case "Sangat Aksesibel":
            return "#1FC16B";

        case "Cukup Aksesibel":
            return "#F5BD4F";

        case "Kurang Aksesibel":
            return "#EC2735";

        case "Tidak Aksesibel":
        case "Tidak tersedia":
            return "#999999";

        default:
            return "#999999";
    }
};

const filterOptions = [
    {
        id: "sangat",
        label: "Sangat Aksesibel (4.0 - 5.0)",
        color: "#1FC16B",
    },
    {
        id: "cukup",
        label: "Cukup Aksesibel (2.5 - 3.9)",
        color: "#F5BD4F",
    },
    {
        id: "kurang",
        label: "Kurang Aksesibel (1.0 - 2.4)",
        color: "#EC2735",
    },
    {
        id: "tidak",
        label: "Tidak tersedia",
        color: "#999999",
    },
];

const facilityIcons = {
    "Jalan Ramp": (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
                d="M14.6666 8.66672V14.6667H1.33331V12.6667L14.6666 8.66672ZM14.4533 4.70672L11.24 2.97339L11.8 4.82672L5.05331 6.82672C4.90329 6.62214 4.7144 6.44915 4.49746 6.31764C4.28052 6.18612 4.03978 6.09867 3.78901 6.06028C3.53824 6.02189 3.28236 6.03332 3.03601 6.09391C2.78966 6.1545 2.55767 6.26306 2.35331 6.41339C2.14873 6.56341 1.97574 6.7523 1.84423 6.96924C1.71271 7.18618 1.62526 7.42692 1.58687 7.67769C1.54848 7.92847 1.55991 8.18434 1.6205 8.43069C1.68109 8.67704 1.78965 8.90903 1.93998 9.11339C2.56665 9.98005 3.77998 10.1601 4.63998 9.52672C5.11331 9.18672 5.39998 8.64672 5.42665 8.06006L12.1733 6.06006L12.7333 7.91339L14.4533 4.70672Z"
                fill="#3E81F3"
            />
        </svg>
    ),

    "Guiding Block (Jalur Pemandu)": (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
                d="M10.6667 7.99996H10.6734M5.33335 7.99996H5.34002M10.6667 12.6666H10.6734M10 3.33329C10 3.5101 10.0703 3.67967 10.1953 3.8047C10.3203 3.92972 10.4899 3.99996 10.6667 3.99996C10.8435 3.99996 11.0131 3.92972 11.1381 3.8047C11.2631 3.67967 11.3334 3.5101 11.3334 3.33329C11.3334 3.15648 11.2631 2.98691 11.3334 2.86189C11.2631 2.73686 10.8435 2.66663 10.6667 2.66663C10.4899 2.66663 10.3203 2.73686 10.1953 2.86189C10.0703 2.98691 10 3.15648 10 3.33329ZM4.66669 3.33329C4.66669 3.5101 4.73693 3.67967 4.86195 3.8047C4.98697 3.92972 5.15654 3.99996 5.33335 3.99996C5.51016 3.99996 5.67973 3.92972 5.80476 3.8047C5.92978 3.67967 6.00002 3.5101 6.00002 3.33329C6.00002 3.15648 5.92978 2.98691 5.80476 2.86189C5.67973 2.73686 5.51016 2.66663 5.33335 2.66663C5.15654 2.66663 4.98697 2.73686 4.86195 2.86189C4.73693 2.98691 4.66669 3.15648 4.66669 3.33329ZM4.66669 12.6666C4.66669 12.8434 4.73693 13.013 4.86195 13.138C4.98697 13.2631 5.15654 13.3333 5.33335 13.3333C5.51016 13.3333 5.67973 13.2631 5.80476 13.138C5.92978 13.013 6.00002 12.8434 6.00002 12.6666C6.00002 12.4898 5.92978 12.3202 5.80476 12.1952C5.67973 12.0702 5.15654 12 5.33335 12C5.15654 12 4.98697 12.0702 4.86195 12.1952C4.73693 12.3202 4.66669 12.4898 4.66669 12.6666Z"
                stroke="#3E81F3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ),

    "Trotoar": (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
        >
            <g clipPath="url(#clip0_246_5463)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.006 0.905003C3.01794 0.781226 3.07557 0.666338 3.16765 0.582764C3.25973 0.49919 3.37965 0.452926 3.504 0.453003H10.504C10.628 0.453422 10.7474 0.499908 10.8391 0.583435C10.9308 0.666962 10.9881 0.781568 11 0.905003L11.19 2.882C11.45 5.568 12.024 8.215 12.9 10.768L13.648 12.949C13.674 13.0243 13.6816 13.1048 13.6702 13.1837C13.6587 13.2625 13.6286 13.3375 13.5824 13.4024C13.5361 13.4673 13.475 13.5201 13.4041 13.5566C13.3332 13.5931 13.2547 13.6121 13.175 13.612H0.831004C0.751315 13.6121 0.672769 13.5931 0.601911 13.5566C0.531053 13.5201 0.469937 13.4673 0.423656 13.4024C0.377375 13.3375 0.34727 13.2625 0.33585 13.1837C0.324429 13.1048 0.332025 13.0243 0.358004 12.949L1.106 10.768C1.98251 8.21527 2.55644 5.56851 2.816 2.882L3.006 0.905003ZM7.625 2.25C7.625 2.08424 7.55916 1.92527 7.44195 1.80806C7.32474 1.69085 7.16576 1.625 7 1.625C6.83424 1.625 6.67527 1.69085 6.55806 1.80806C6.44085 1.92527 6.375 2.08424 6.375 2.25V3.75C6.375 3.91576 6.44085 4.07473 6.55806 4.19194C6.67527 4.30915 6.83424 4.375 7 4.375C7.16576 4.375 7.32474 4.30915 7.44195 4.19194C7.55916 4.07473 7.625 3.91576 7.625 3.75V2.25ZM7.625 6.25C7.625 6.08424 7.55916 5.92527 7.44195 5.80806C7.32474 5.69085 7.16576 5.625 7 5.625C6.83424 5.625 6.67527 5.69085 6.55806 5.80806C6.44085 5.92527 6.375 6.08424 6.375 6.25V7.75C6.375 7.91576 6.44085 8.07473 6.55806 8.19195C6.67527 8.30916 6.83424 8.375 7 8.375C7.16576 8.375 7.32474 8.30916 7.44195 8.19195C7.55916 8.07473 7.625 7.91576 7.625 7.75V6.25ZM7 9.625C7.345 9.625 7.625 9.905 7.625 10.25V11.75C7.625 11.9158 7.55916 12.0747 7.44195 12.1919C7.32474 12.3092 7.16576 12.375 7 12.375C6.83424 12.375 6.67527 12.3092 6.55806 12.1919C6.44085 12.0747 6.375 11.9158 6.375 11.75V10.25C6.375 9.905 6.655 9.625 7 9.625Z"
                    fill="#3E81F3"
                />
            </g>
            <defs>
                <clipPath id="clip0_246_5463">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    ),

    "Jalan Penyeberangan": (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
        >
            <path
                d="M9.59998 2.39998C9.59998 2.75361 9.45951 3.09274 9.20946 3.34279C8.95941 3.59284 8.62027 3.73332 8.26665 3.73332C7.91303 3.73332 7.57389 3.59284 7.32384 3.34279C7.07379 3.09274 6.93332 2.75361 6.93332 2.39998C6.93332 2.04636 7.07379 1.70722 7.32384 1.45717C7.57389 1.20713 7.91303 1.06665 8.26665 1.06665C8.62027 1.06665 8.95941 1.20713 9.20946 1.45717C9.45951 1.70722 9.59998 2.04636 9.59998 2.39998ZM6.93332 3.99998H7.73332L12.2667 7.17865V7.91465H11.7333L9.06665 6.01598V7.91465L10.1333 9.86665L11.2 12.3093L10.6667 12.8H10.1333L9.06665 10.3573L6.93332 7.42398V5.14132L5.59998 6.19732L4.53332 7.91465H3.73332V7.42398L4.53332 5.95198L6.93332 3.99998ZM7.38132 9.08799L6.15465 12.8H5.59998L5.06665 12.3093L6.57065 8.18132L7.38132 9.08799ZM2.13332 13.3333H5.33332L4.26665 14.9333H1.06665L2.13332 13.3333ZM6.93332 13.3333H9.06665L10.1333 14.9333H5.86665L6.93332 13.3333ZM13.8667 13.3333L14.9333 14.9333H11.7333L10.6667 13.3333H13.8667Z"
                fill="#3E81F3"
            />
        </svg>
    ),

    "Tempat duduk": (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
        >
            <g clipPath="url(#clip0_246_5461)">
                <path
                    d="M5.40802 5.61065C5.12002 3.71198 7.77602 3.14665 8.19202 5.07731L8.91736 8.77865L11.6054 8.78931C12.3947 8.78931 12.8 9.43998 12.8 10.0373V15.0826C12.8 16.3093 11.104 16.2986 11.104 15.0613V11.1466H7.66936C6.86936 11.1466 6.36802 10.5706 6.24002 9.91998L5.40802 5.61065ZM5.08802 1.77065C5.03469 2.38931 5.33336 2.97598 5.83469 3.29598C6.34669 3.62665 6.99736 3.62665 7.49869 3.29598C8.01069 2.97598 8.29869 2.38931 8.25602 1.77065C8.28005 1.47161 8.22227 1.17167 8.08885 0.902972C7.95544 0.63427 7.75143 0.406931 7.49869 0.245314C6.99736 -0.0853522 6.34669 -0.0853522 5.83469 0.245314C5.33336 0.565314 5.03469 1.15198 5.08802 1.77065ZM3.22136 7.59465C3.02936 6.53865 4.37336 6.29331 4.55469 7.34931L5.15202 10.6453C5.28002 11.328 5.77069 11.9253 6.47469 12.1386C6.67736 12.2133 6.90136 12.2133 7.11469 12.2346L9.05602 12.2453C10.0907 12.2346 10.08 13.6426 9.04536 13.632L7.00802 13.6213C6.68802 13.6213 6.37869 13.5786 6.05869 13.4826C4.85336 13.1093 4.01069 12.0853 3.78669 10.8906L3.22136 7.59465Z"
                    fill="#3E81F3"
                />
            </g>

            <defs>
                <clipPath id="clip0_246_5461">
                    <rect width="16" height="16" fill="white" />
                </clipPath>
            </defs>
        </svg>
    ),

    "Papan Informasi": (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
        >
            <path
                d="M11.75 2H10.915C10.8116 1.70742 10.6199 1.45413 10.3665 1.27503C10.1131 1.09593 9.81033 0.999838 9.5 1H6.5C6.18967 0.999838 5.88694 1.09593 5.63351 1.27503C5.38008 1.45413 5.18844 1.70742 5.085 2H4.25C3.78587 2 3.34075 2.18437 3.01256 2.51256C2.68437 2.84075 2.5 3.28587 2.5 3.75V13.25C2.5 13.7141 2.68437 14.1592 3.01256 14.4874C3.34075 14.8156 3.78587 15 4.25 15H11.75C12.2141 15 12.6592 14.8156 12.9874 14.4874C13.3156 14.1592 13.5 13.7141 13.5 13.25V3.75C13.5 3.28587 13.3156 2.84075 12.9874 2.51256C12.6592 2.18437 12.2141 2 11.75 2ZM6.5 2H9.5C9.63261 2 9.75979 2.05268 9.85355 2.14645C9.94732 2.24022 10 2.36739 10 2.5C10 2.63261 9.94732 2.75979 9.85355 2.85355C9.75979 2.94732 9.63261 3 9.5 3H6.5C6.36739 3 6.24021 2.94732 6.14645 2.85355C6.05268 2.75979 6 2.5 6 2.5C6 2.36739 6.05268 2.24022 6.14645 2.14645C6.24021 2.05268 6.36739 2 6.5 2ZM5.25 6C5.44891 6 5.63968 6.07902 5.78033 6.21967C5.92098 6.36032 6 6.55109 6 6.75V11.25C6 11.4489 5.92098 11.6397 5.78033 11.7803C5.63968 11.921 5.44891 12 5.25 12C5.05109 12 4.86032 11.921 4.71967 11.7803C4.57902 11.6397 4.5 11.4489 4.5 11.25V6.75C4.5 6.55109 4.57902 6.36032 4.71967 6.21967C4.86032 6.07902 5.05109 6 5.25 6ZM7.25 7.75C7.25 7.55109 7.32902 7.36032 7.46967 7.21967C7.61032 7.07902 7.80109 7 8 7C8.19891 7 8.38968 7.07902 8.53033 7.21967C8.67098 7.36032 8.75 7.55109 8.75 7.75V11.25C8.75 11.4489 8.67098 11.6397 8.53033 11.7803C8.38968 11.921 8.19891 12 8 12C7.80109 12 7.61032 11.921 7.46967 11.7803C7.32902 11.6397 7.25 11.4489 7.25 11.25V7.75ZM10.75 9C10.9489 9 11.1397 9.07902 11.2803 9.21967C11.421 9.36032 11.5 9.55109 11.5 9.75V11.25C11.5 11.4489 11.421 11.6397 11.2803 11.7803C11.1397 11.921 10.9489 12 10.75 12C10.5511 12 10.3603 11.921 10.2197 11.7803C10.079 11.6397 10 11.4489 10 11.25V9.75C10 9.55109 10.079 9.36032 10.2197 9.21967C10.3603 9.07902 10.5511 9 10.75 9Z"
                fill="#3E81F3"
            />
        </svg>
    ),

    "Lampu": (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
        >
            <path
                d="M11.2058 3.71062C10.5992 2.48562 9.42666 1.58145 8.0675 1.28395C6.64416 0.96895 5.18583 1.30728 4.07167 2.20562C3.52161 2.64293 3.07785 3.19924 2.77374 3.83273C2.46962 4.46623 2.31306 5.16041 2.31583 5.86312C2.31583 7.37395 3.22 8.95478 4.585 9.87062V10.3548C4.57917 10.5181 4.57333 10.7689 4.77167 10.9731C4.97583 11.1831 5.27916 11.2064 5.51833 11.2064H8.51083C8.82583 11.2064 9.065 11.1189 9.22833 10.9556C9.45 10.7281 9.44416 10.4365 9.43833 10.2789V9.87062C11.2467 8.65145 12.3842 6.07895 11.2058 3.71062ZM8.90166 12.8322C8.86666 12.8322 8.82583 12.8264 8.79083 12.8147C7.61833 12.4822 6.3875 12.4822 5.215 12.8147C4.99916 12.873 4.77166 12.7505 4.71333 12.5347C4.69826 12.4834 4.69356 12.4296 4.69953 12.3764C4.70549 12.3233 4.72199 12.2718 4.74806 12.2251C4.77413 12.1784 4.80924 12.1374 4.85136 12.1044C4.89347 12.0714 4.94174 12.0471 4.99333 12.033C6.31166 11.6597 7.7 11.6597 9.01833 12.033C9.23416 12.0972 9.3625 12.3189 9.29833 12.5347C9.24 12.7155 9.07666 12.8322 8.90166 12.8322Z"
                fill="#3E81F3"
            />
        </svg>
    ),

    "Atap": (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
        >
            <path
                d="M14.25 12H16.5L9 5.25L1.5 12H3.75L9 7.2675L14.25 12ZM5.25 6.6075V5.25H3V8.625L5.25 6.6075Z"
                fill="#3E81F3"
            />
        </svg>
    ),

    "Pegawai Trans": (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
        >
            <path
                d="M6.55666 6.29605C7.94412 6.29605 9.06888 5.17129 9.06888 3.78383C9.06888 2.39637 7.94412 1.27161 6.55666 1.27161C5.16919 1.27161 4.04443 2.39637 4.04443 3.78383C4.04443 5.17129 5.16919 6.29605 6.55666 6.29605Z"
                fill="#3E81F3"
            />
            <path
                d="M8.16669 10.8889H10.8889V11.4334H8.16669V10.8889Z"
                fill="#3E81F3"
            />
            <path
                d="M5.83335 11.6666V12.8333C5.83335 12.9364 5.87432 13.0354 5.94726 13.1083C6.02019 13.1812 6.1191 13.2222 6.22224 13.2222H12.8334C12.9365 13.2222 13.0354 13.1812 13.1083 13.1083C13.1813 13.0354 13.2222 12.9364 13.2222 12.8333V8.94441C13.2222 8.84127 13.1813 8.74236 13.1083 8.66943C13.0354 8.5965 12.9365 8.55552 12.8334 8.55552H10.1111V7.98386C10.1111 7.88072 10.0702 7.7818 9.99723 7.70887C9.9243 7.63594 9.82538 7.59497 9.72224 7.59497C9.6191 7.59497 9.52019 7.63594 9.44726 7.70887C9.37432 7.7818 9.33335 7.88072 9.33335 7.98386V8.55552H8.55557V7.1633C7.89476 7.05517 7.22629 7.00055 6.55669 6.99997C5.08 6.99369 3.61985 7.31094 2.27891 7.92941C2.05821 8.03356 1.87202 8.19884 1.74243 8.40563C1.61284 8.61243 1.54529 8.85205 1.5478 9.09608V11.6666H5.83335ZM12.4445 12.4444H6.61113V9.3333H9.33335V9.49664C9.33335 9.59978 9.37432 9.69869 9.44726 9.77162C9.52019 9.84455 9.6191 9.88552 9.72224 9.88552C9.82538 9.88552 9.9243 9.84455 9.99723 9.77162C10.0702 9.69869 10.1111 9.59978 10.1111 9.49664V9.3333H12.4445V12.4444Z"
                fill="#3E81F3"
            />
        </svg>
    ),
};

export default function MapPage({ onBack, mapAction }) {
    const [haltes, setHaltes] = useState([]);
    const [searchLocation, setSearchLocation] = useState("");
    const [selectedHalte, setSelectedHalte] = useState(null);
    const [selectedFoto, setSelectedFoto] = useState(null);
    const [visibleHalteIds, setVisibleHalteIds] = useState(null);

    const [showFilter, setShowFilter] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState(
        filterOptions.map((filter) => filter.id)
    );

    const mapIframeRef = useRef(null);

    const handleMapSearch = async () => {
        const destination = searchLocation.trim();

        if (!destination) return;

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/search-halte?destination=${encodeURIComponent(destination)}`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                alert(result.message || "Lokasi tidak ditemukan");
                return;
            }

            const { lat, long } = result.destination;

            mapIframeRef.current?.contentWindow?.postMessage(
                {
                    type: "SEARCH_LOCATION",
                    lat: Number(lat),
                    long: Number(long),
                },
                "http://127.0.0.1:8000"
            );
        } catch (error) {
            console.error("Gagal mencari lokasi:", error);
            alert("Gagal mencari lokasi");
        }
    };

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/haltes")
            .then((response) => response.json())
            .then((result) => {
                console.log("DATA HALTE DATABASE:", result);
                setHaltes(result.data || []);
            })
            .catch((error) => {
                console.error("GAGAL MENGAMBIL DATA HALTE:", error);
            });
    }, []);

    const toggleFilter = (id) => {
        setSelectedFilters((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    };

    useEffect(() => {
        mapIframeRef.current?.contentWindow?.postMessage(
            {
                type: "FILTER_ACCESSIBILITY",
                filters: selectedFilters,
            },
            "http://127.0.0.1:8000"
        );
    }, [selectedFilters]);

    useEffect(() => {
        const handleMapMessage = (event) => {
            if (
                event.origin !== "http://127.0.0.1:5173" &&
                event.origin !== "http://localhost:5173"
            ) {
                return;
            }

            if (event.data?.type !== "VISIBLE_HALTES") {
                return;
            }

            setVisibleHalteIds(event.data.ids || []);
        };

        window.addEventListener("message", handleMapMessage);

        return () => {
            window.removeEventListener("message", handleMapMessage);
        };
    }, []);

    // Filter Halte
    const filteredHaltes = haltes.filter((halte) => {
        // Filter aksesibilitas
        const cocokAksesibilitas =
            selectedFilters.length === 0 ||
            selectedFilters.some((filter) => {
                if (filter === "sangat") {
                    return halte.kelas === "Sangat Aksesibel";
                }

                if (filter === "cukup") {
                    return halte.kelas === "Cukup Aksesibel";
                }

                if (filter === "kurang") {
                    return halte.kelas === "Kurang Aksesibel";
                }

                if (filter === "tidak") {
                    return (
                        halte.kelas === "Tidak Aksesibel" ||
                        halte.kelas === "Tidak tersedia"
                    );
                }

                return false;
            });

        // Filter viewport
        const cocokViewport =
            visibleHalteIds === null ||
            visibleHalteIds.includes(halte.id);

        return cocokAksesibilitas && cocokViewport;
    });

    return (
        <div className="h-screen overflow-hidden bg-[#F7F9FC]">

            {/* CONTAINER UTAMA */}
            <div className="mx-auto h-screen w-full max-w-[1200px] overflow-hidden bg-white">

                {/* HEADER */}
                <header className="relative h-[150px] bg-[#F8F8F8] shadow-[0_4px_4px_rgba(0,0,0,0.10)]">

                    {/* JUDUL HEADER */}
                    <div className="relative flex items-center justify-center px-5 pt-8 md:px-10">

                        {/* BACK BUTTON */}
                        <button
                            onClick={onBack}
                            className="absolute left-5 top-8 flex h-[18px] w-[18px] items-center justify-center p-0 md:left-10"
                            aria-label="Kembali"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                            >
                                <path
                                    d="M7.1775 4.44751L2.625 9.00001L7.1775 13.5525"
                                    stroke="#242424"
                                    strokeWidth="1.5"
                                    strokeMiterlimit="10"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M15.3749 9H2.75244"
                                    stroke="#242424"
                                    strokeWidth="1.5"
                                    strokeMiterlimit="10"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        {/* TITLE */}
                        <h1 className="text-center font-['Poppins'] text-[16px] font-medium leading-[16px] text-[#1F1F1F]">
                            Accessibility Map
                        </h1>

                        {/* FILTER BUTTON */}
                        <button
                            type="button"
                            onClick={() => setShowFilter(true)}
                            className="absolute right-5 top-8 flex h-[24px] w-[24px] items-center justify-center p-0 md:right-10"
                            aria-label="Filter"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M2 4.6C2 4.03995 2 3.75992 2.10899 3.54601C2.20487 3.35785 2.35785 3.20487 2.54601 3.10899C2.75992 3 3.03995 3 3.6 3H20.4C20.9601 3 21.2401 3 21.454 3.10899C21.6422 3.20487 21.7951 3.35785 21.891 3.54601C22 3.75992 22 4.03995 22 4.6V5.26939C22 5.53819 22 5.67259 21.9672 5.79756C21.938 5.90831 21.8901 6.01323 21.8255 6.10776C21.7526 6.21443 21.651 6.30245 21.4479 6.4785L15.0521 12.0215C14.849 12.1975 14.7474 12.2856 14.6745 12.3922C14.6099 12.4868 14.562 12.5917 14.5328 12.7024C14.5 12.8274 14.5 12.9618 14.5 13.2306V18.4584C14.5 18.6539 14.5 18.7517 14.4685 18.8363C14.4406 18.911 14.3953 18.9779 14.3363 19.0315C14.2695 19.0922 14.1787 19.1285 13.9971 19.2012L10.5971 20.5612C10.2296 20.7082 10.0458 20.7817 9.89827 20.751C9.76927 20.7242 9.65605 20.6476 9.58325 20.5377C9.5 20.4122 9.5 20.2142 9.5 19.8184V13.2306C9.5 12.9618 9.5 12.8274 9.46715 12.7024C9.43805 12.5917 9.39014 12.4868 9.32551 12.3922C9.25258 12.2856 9.15102 12.1975 8.94789 12.0215L2.55211 6.4785C2.34898 6.30245 2.24742 6.21443 2.17449 6.10776C2.10986 6.01323 2.06195 5.90831 2.03285 5.79756C2 5.67259 2 5.53819 2 5.26939V4.6Z"
                                    stroke="#9B9B9B"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        {/* SEARCH & FILTER */}
                        <div className="absolute left-5 right-5 top-[78px] md:left-10 md:right-10">

                            {/* SEARCH BAR */}
                            <div className="flex h-[40px] w-full items-center gap-3 rounded-[8px] bg-white px-4 shadow-[8px_12px_20px_rgba(0,0,0,0.02)]">

                                {/* LOCATION ICON */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="13"
                                    height="16"
                                    viewBox="0 0 13 16"
                                    fill="none"
                                    className="flex-shrink-0"
                                >
                                    <path
                                        d="M12.5 6.5C12.5 11.1667 6.5 15.1667 6.5 15.1667C6.5 15.1667 0.5 11.1667 0.5 6.5C0.5 4.9087 1.13214 3.38258 2.25736 2.25736C3.38258 1.13214 4.9087 0.5 6.5 0.5C8.0913 0.5 9.61742 1.13214 10.7426 2.25736C11.8679 3.38258 12.5 4.9087 12.5 6.5Z"
                                        stroke="#9B9B9B"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M6.5 8.5C7.60457 8.5 8.5 7.60457 8.5 6.5C8.5 5.39543 7.60457 4.5 6.5 4.5C5.39543 4.5 4.5 5.39543 4.5 6.5C4.5 7.60457 5.39543 8.5 6.5 8.5Z"
                                        stroke="#9B9B9B"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>

                                {/* INPUT LOKASI */}
                                <input
                                    type="text"
                                    placeholder="Jalan Malioboro"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleMapSearch();
                                        }
                                    }}
                                    className="min-w-0 flex-1 border-0 bg-transparent p-0 font-['Inter'] text-[12px] font-medium leading-normal text-[#9B9B9B] outline-none placeholder:text-[#9B9B9B]"
                                />

                                <button
                                    type="button"
                                    onClick={handleMapSearch}
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                                    aria-label="Cari lokasi"
                                >
                                    <span className="text-[16px]">🔍</span>
                                </button>

                            </div>

                        </div>

                    </div>

                </header>

                <main className="relative h-[calc(100vh-150px-76px)] w-full overflow-hidden">
                    <iframe
                        ref={mapIframeRef}
                        src={
                            mapAction?.center
                                ? `http://127.0.0.1:8000/map?lat=${mapAction.center[1]}&long=${mapAction.center[0]}`
                                : "http://127.0.0.1:8000/map?lat=-7.80115625421&long=110.36040362"
                        }
                        onLoad={() => {
                            mapIframeRef.current?.contentWindow?.postMessage(
                                {
                                    type: "FILTER_ACCESSIBILITY",
                                    filters: selectedFilters,
                                },
                                "http://127.0.0.1:8000"
                            );
                        }}
                        className="h-full w-full border-0"
                        title="Accessibility Map"
                    />

                    <div className="absolute bottom-0 left-0 w-full overflow-x-auto px-4 pb-4">
                        <div className="flex w-max gap-4">
                            {filteredHaltes.map((halte) => (
                                <button
                                    key={halte.id}
                                    type="button"
                                    onClick={() => setSelectedHalte(halte)}
                                    className="flex h-[110px] w-[243px] flex-shrink-0 items-center justify-between rounded-[6px] bg-white p-4 text-left shadow-[0_10px_40px_0_rgba(0,0,0,0.04)]"
                                >
                                    <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                                        <div className="flex items-center">
                                            <span className="font-['Nunito'] text-[14px] font-medium leading-[14px] text-[#292D32]">
                                                {halte.nama}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span
                                                className="h-[12.656px] w-[12.656px] flex-shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor: getAksesibilitasColor(halte.kelas),
                                                }}
                                            />

                                            <span className="font-['Nunito'] text-[12px] font-normal leading-[12px] text-[#17191C] opacity-50">
                                                {halte.kelas}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="14"
                                                height="14"
                                                viewBox="0 0 14 14"
                                                fill="none"
                                                className="flex-shrink-0"
                                            >
                                                <path
                                                    d="M12.25 5.83337C12.25 9.91671 7 13.4167 7 13.4167C7 13.4167 1.75 9.91671 1.75 5.83337C1.75 4.44099 2.30312 3.10563 3.28769 2.12106C4.27226 1.1365 5.60761 0.583374 7 0.583374C8.39239 0.583374 9.72774 1.1365 10.7123 2.12106C11.6969 3.10563 12.25 4.44099 12.25 5.83337Z"
                                                    stroke="#0063F3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M7 7.58337C7.9665 7.58337 8.75 6.79987 8.75 5.83337C8.75 4.86688 7.9665 4.08337 7 4.08337C6.0335 4.08337 5.25 4.86688 5.25 5.83337C5.25 6.79987 6.0335 7.58337 7 7.58337Z"
                                                    stroke="#0063F3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>

                                            <span className="font-['Nunito'] text-[12px] font-normal leading-[12px] text-[#A69F9F]">
                                                Jarak {halte.jarak}
                                            </span>
                                        </div>
                                    </div>

                                    {/* RATING + THUMBNAIL */}
                                    <div className="flex w-[58px] flex-shrink-0 flex-col items-end">
                                        <span className="font-['Nunito'] text-[12px] font-semibold leading-[12px] text-[#A69F9F]">
                                            {halte.rating}
                                        </span>

                                        <div className="mt-[15px] h-[51px] w-[58px] overflow-hidden rounded-[6px] bg-[#D0D5DD]">
                                            {halte.foto?.length > 1 ? (
                                                <img
                                                    src={halte.foto[1]}
                                                    alt={`Foto ${halte.nama}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : halte.foto?.length > 0 ? (
                                                <img
                                                    src={halte.foto[0]}
                                                    alt={`Foto ${halte.nama}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </main>

                {/*Panel Filter*/}
                {showFilter && (
                    <div
                        className="fixed inset-0 z-40 bg-black/20"
                        onClick={() => setShowFilter(false)}
                    >
                        <div
                            className="absolute bottom-[76px] left-1/2 w-full max-w-[353px] -translate-x-1/2 rounded-[40px_40px_0_0] bg-[#F8F8F8] p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="font-['Inter'] text-[16px] font-medium leading-normal text-[#242424]">
                                Filter Aksesibilitas
                            </h2>

                            <div className="mt-4 flex w-full flex-col items-start gap-[15px] rounded-[10px] bg-white p-4">
                                {filterOptions.map((filter) => (
                                    <label
                                        key={filter.id}
                                        className="flex w-full cursor-pointer items-center gap-3"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedFilters.includes(filter.id)}
                                            onChange={() => toggleFilter(filter.id)}
                                            className="sr-only"
                                        />

                                        <span
                                            className="h-[14px] w-[14px] flex-shrink-0 rounded-full border"
                                            style={{
                                                borderColor: filter.color,
                                                backgroundColor: selectedFilters.includes(filter.id)
                                                    ? filter.color
                                                    : "white",
                                            }}
                                        />

                                        <span className="font-['Rubik'] text-[12px] font-medium leading-[16px] text-[#999]">
                                            {filter.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Panel Halte */}
                {selectedHalte && (
                    <div
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/20"
                        onClick={() => setSelectedHalte(null)}
                    >
                        <div
                            className="flex h-[68vh] w-full max-w-[480px] flex-col rounded-[40px_40px_0_0] bg-[#F8F8F8] p-5"
                            onClick={(e) => e.stopPropagation()}
                        >

                            {/* BACK BUTTON */}
                            <button
                                type="button"
                                onClick={() => setSelectedHalte(null)}
                                className="mb-3 flex h-[24px] w-[24px] flex-shrink-0 items-center justify-center"
                                aria-label="Kembali"
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 18 18"
                                    fill="none"
                                >
                                    <path
                                        d="M11.25 3.75L6.75 9L11.25 14.25"
                                        stroke="#242424"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>

                            {/* HEADER HALTE - TETAP */}
                            <div className="flex flex-shrink-0 items-center justify-between">
                                <h2 className="whitespace-nowrap font-['Nunito'] text-[20px] font-semibold leading-[20px] text-[#242424]">
                                    {selectedHalte.nama}
                                </h2>

                                <span className="w-[33px] font-['Nunito'] text-[20px] font-semibold leading-[20px] text-[#242424]">
                                    {selectedHalte.rating}
                                </span>
                            </div>

                            {/* AREA LUAR - BISA SCROLL */}
                            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pb-[90px]">

                                {/* CARD FASILITAS */}
                                <div className="rounded-[10px] bg-white p-4">

                                    <h3 className="mt-1 font-['Nunito'] text-[16px] font-medium text-[#292D32]">
                                        Fasilitas Aksesibilitas
                                    </h3>

                                    {/* LIST FASILITAS - BISA SCROLL SENDIRI */}
                                    <div className="flex flex-col gap-3">
                                        {[
                                            {
                                                key: "atap",
                                                label: "Atap",
                                                iconKey: "Atap",
                                                conditionKey: "kondisi_atap",
                                                tooltip: true,
                                            },
                                            {
                                                key: "ramp",
                                                label: "Jalan Ramp",
                                                iconKey: "Jalan Ramp",
                                                conditionKey: "kondisi_ramp",
                                                tooltip: true,
                                            },
                                            {
                                                key: "guiding_block",
                                                label: "Guiding Block (Jalur Pemandu)",
                                                iconKey: "Guiding Block (Jalur Pemandu)",
                                                conditionKey: "kondisi_guiding_block",
                                                tooltip: true,
                                            },
                                            {
                                                key: "trotoar",
                                                label: "Trotoar",
                                                iconKey: "Trotoar",
                                                conditionKey: "kondisi_trotoar",
                                                tooltip: true,
                                            },
                                            {
                                                key: "fas_pegawa",
                                                label: "Pegawai Trans",
                                                iconKey: "Pegawai Trans",
                                                tooltip: false,
                                            },
                                            {
                                                key: "tempat_duduk",
                                                label: "Tempat duduk",
                                                iconKey: "Tempat duduk",
                                                tooltip: false,
                                            },
                                            {
                                                key: "papan_informasi",
                                                label: "Papan Informasi",
                                                iconKey: "Papan Informasi",
                                                tooltip: false,
                                            },
                                            {
                                                key: "lampu",
                                                label: "Lampu",
                                                iconKey: "Lampu",
                                                tooltip: false,
                                            },
                                            {
                                                key: "penyeberangan",
                                                label: "Jalan Penyeberangan",
                                                iconKey: "Jalan Penyeberangan",
                                                tooltip: false,
                                            },
                                        ]
                                            .filter(
                                                (item) =>
                                                    selectedHalte.fasilitas?.[item.key] === "ada"
                                            )
                                            .map((item) => {
                                                const kondisi =
                                                    selectedHalte.fasilitas?.[item.conditionKey];

                                                return (
                                                    <div
                                                        key={item.key}
                                                        className="flex items-center gap-4"
                                                    >
                                                        {/* ICON FASILITAS */}
                                                        <div className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-[8px] bg-[#E7EDFF]">
                                                            {facilityIcons[item.iconKey]}
                                                        </div>

                                                        {/* NAMA FASILITAS */}
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <span className="font-['Nunito'] text-[14px] font-normal leading-normal text-[#999]">
                                                                {item.label}
                                                            </span>

                                                            {/* ICON INFO + TOOLTIP KHUSUS 4 FASILITAS */}
                                                            {item.tooltip && (
                                                                <span className="group relative flex h-[13px] w-[13px] flex-shrink-0 cursor-help items-center justify-center">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width="13"
                                                                        height="13"
                                                                        viewBox="0 0 13 13"
                                                                        fill="none"
                                                                    >
                                                                        <path
                                                                            d="M6.33333 4V6.33333M6.33333 8.66667H6.33917M12.1667 6.33333C12.1667 9.555 9.555 12.1667 6.33333 12.1667C3.11167 12.1667 0.5 9.555 0.5 6.33333C0.5 3.11167 3.11167 0.5 6.33333 0.5C9.555 0.5 12.1667 3.11167 12.1667 6.33333Z"
                                                                            stroke="#999999"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        />
                                                                    </svg>

                                                                    {/* TOOLTIP */}
                                                                    <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-max max-w-[230px] -translate-x-1/2 rounded-[6px] bg-[#333] px-3 py-2 font-['Nunito'] text-[11px] font-normal leading-[15px] text-white shadow-md group-hover:block">
                                                                        {item.label}{" "}
                                                                        {kondisi
                                                                            ? `dalam kondisi ${kondisi}`
                                                                            : "tersedia"}
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* JARAK SEBELUM FOTO */}
                                <div className="h-5" />

                                {/* CARD FOTO */}
                                <div className="rounded-[10px] bg-white p-4">

                                    <h3 className="mt-1 font-['Nunito'] text-[16px] font-medium text-[#292D32]">
                                        Foto Halte
                                    </h3>

                                    <div className="mt-3 flex gap-[18px] overflow-x-auto">
                                        {selectedHalte.foto?.map((foto, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => {
                                                    console.log("FOTO DIKLIK:", foto);
                                                    setSelectedFoto(foto);
                                                }}
                                                className="h-[95px] w-[95px] flex-shrink-0 cursor-pointer overflow-hidden rounded-[10px] bg-[#F7F7F7] p-0"
                                            >
                                                <img
                                                    src={foto}
                                                    alt={`Foto ${selectedHalte.nama} ${index + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Preview Foto */}
                {selectedFoto && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5"
                        onClick={() => setSelectedFoto(null)}
                    >
                        <div
                            className="relative max-w-[90vw]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedFoto(null)}
                                className="absolute -right-2 -top-10 flex h-[30px] w-[30px] items-center justify-center text-white"
                                aria-label="Tutup foto"
                            >
                                ✕
                            </button>

                            <img
                                src={selectedFoto}
                                alt={`Foto ${selectedHalte.nama}`}
                                className="max-h-[80vh] max-w-full rounded-[10px] object-contain"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}