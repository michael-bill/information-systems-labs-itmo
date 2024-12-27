const Loading = ({ fullScreen = false }) => {
    const containerClass = fullScreen
        ? "fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
        : "w-full h-64 flex items-center justify-center";

    return (
        <div className={containerClass}>
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-xl">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <div className="text-gray-700 text-lg font-medium mt-4">
                    Загрузка...
                </div>
            </div>
        </div>
    );
};

export default Loading;