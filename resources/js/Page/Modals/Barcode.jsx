import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

const Barcode = ({ value }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!value || !ref.current) return;

        const canvas = document.createElement("canvas");

        JsBarcode(canvas, value, {
            format: "CODE128",
            width: 1.5,
            height: 40,
            displayValue: true,
            fontSize: 12,
            lineColor: "#000000",
            background: "#ffffff",
        });

        const img = document.createElement("img");
        img.src = canvas.toDataURL("image/png");

        ref.current.innerHTML = "";
        ref.current.appendChild(img);
    }, [value]);

    return <div ref={ref}></div>;
};

export default Barcode;