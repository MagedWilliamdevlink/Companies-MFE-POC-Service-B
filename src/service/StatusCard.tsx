export default function StatusCard({ items, failedIcon = false, title }) {
  return (
    <div
      className="flex flex-col items-center justify-center  bg-[#121212] font-sans"
      dir="rtl"
    >
      {/* Success Icon */}
      <div className="w-20 h-20 bg-[#50B498] rounded-full flex items-center justify-center mb-6 shadow-lg">
        {failedIcon ? (
          <svg width="111" height="111" viewBox="0 0 111 111" fill="none">
            <path
              d="M55.5 0C86.1518 0 111 24.8482 111 55.5C111 86.1518 86.1518 111 55.5 111C24.8482 111 0 86.1518 0 55.5C0 24.8482 24.8482 0 55.5 0ZM80.3135 30.7432C77.5438 28.0463 73.1121 28.1054 70.415 30.875L55.0752 46.626L37.96 32.8242C34.9506 30.3976 30.543 30.8706 28.1162 33.8799C25.69 36.8892 26.1628 41.296 29.1719 43.7227L45.2646 56.7002L30.8408 71.5127C28.1438 74.2824 28.2031 78.714 30.9727 81.4111C33.7422 84.1082 38.1739 84.0506 40.8711 81.2812L56.2109 65.5283L73.3262 79.3311C76.3355 81.7578 80.7431 81.2856 83.1699 78.2764C85.5967 75.2672 85.1251 70.8596 82.1162 68.4326L66.0215 55.4531L80.4453 40.6416C83.1422 37.8719 83.0831 33.4403 80.3135 30.7432Z"
              fill="#EB3E3E"
            />
          </svg>
        ) : (
          <svg width="111" height="111" viewBox="0 0 111 111" fill="none">
            <path
              d="M55.5 0C86.1518 0 111 24.8482 111 55.5C111 86.1518 86.1518 111 55.5 111C24.8482 111 0 86.1518 0 55.5C0 24.8482 24.8482 0 55.5 0ZM90.9346 29.7373C88.1649 27.0405 83.7332 27.0997 81.0361 29.8691L46.8965 64.9258L35.7422 51.4639C33.2757 48.4872 28.8626 48.0738 25.8857 50.54C22.9088 53.0066 22.4953 57.4196 24.9619 60.3965L46.0566 85.8564L51.4912 80.2754L91.0664 39.6357C93.763 36.8661 93.7039 32.4343 90.9346 29.7373Z"
              fill="#54B5A6"
            />
          </svg>
        )}
      </div>

      {/* Main Message */}
      <h1 className="text-[#50B498] text-2xl font-bold mb-8">{title}</h1>

      {/* Dynamic Info Card */}
      <div
        className="bg-[#F8F9FB] rounded-2xl overflow-hidden shadow-xl"
        style={{
          width: "500px",
        }}
      >
        <div
          className="flex flex-col bg-white rounded-2xl"
          style={{
            padding: "16px",
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between items-start ${
                index !== items.length - 1 ? "border-b border-gray-200" : ""
              }`}
              style={{
                padding: "8px",
              }}
            >
              {/* Label (Right side in RTL) */}
              <span
                className="text-gray-500 text-sm whitespace-nowrap"
                style={{
                  minWidth: "64px",
                }}
              >
                {item.label}
              </span>

              {/* Value (Left side in RTL) */}
              <span
                className={`text-right text-sm font-medium max-w-3`}
                style={{
                  color: item.valueColor,
                  textAlign: "end",
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
