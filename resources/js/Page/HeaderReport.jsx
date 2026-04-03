import React, { useState, useEffect } from "react";
import axios from "axios";

export const EnteteRapport = () => {
    const [data, setData] = useState(null);

    const getData = async () => {
        try {
            const res = await axios.get("/eco/page/header-report");
            if (res.data.status === 1) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Erreur chargement en-tête", error);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    if (!data) {
        return <div className="entete-placeholder" />; // ou un loader minimal
    }

    return (
        <>
        <div className="entete-rapport">
            <div className="entete-logo">
                <img
                    src={`uploads/images/logo/${data.company_logo || "default.jpg"}`}
                    alt="Logo"
                />
            </div>
            <div className="entete-infos">
                <h2 className="entete-denomination">{data.denomination}</h2>
                <h3 className="entete-sigle">« {data.sigle} »</h3>
                <div className="entete-coordonnees">
                    <p>
                        <i className="fas fa-map-marker-alt"></i> {data.ville}, {data.pays}
                    </p>
                    <p>
                        <i className="fas fa-phone-alt"></i> {data.tel}
                    </p>
                    <p>
                        <i className="fas fa-envelope"></i> {data.email}
                    </p>
                </div>
            </div>
            <div className="entete-logo entete-logo-droite">
                <img
                    src={`uploads/images/logo/${data.company_logo || "default.jpg"}`}
                    alt="Logo secondaire"
                />
            </div>
        </div>

         <style>
        {`
        .entete-rapport {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    border-radius: 24px;
    padding: 20px 30px;
    margin-bottom: 24px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid #eef2ff;
    flex-wrap: wrap;
    gap: 20px;
}

.entete-logo {
    flex: 0 0 auto;
}
.entete-logo img {
    height: 80px;
    width: auto;
    max-width: 150px;
    object-fit: contain;
}
.entete-logo-droite {
    text-align: right;
}
.entete-infos {
    flex: 1;
    text-align: center;
}
.entete-denomination {
    font-size: 1.6rem;
    font-weight: 700;
    margin: 0 0 4px;
    color: #1e293b;
    letter-spacing: -0.3px;
}
.entete-sigle {
    font-size: 1.2rem;
    font-weight: 500;
    color: #0f766e;
    margin: 0 0 8px;
}
.entete-coordonnees {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    font-size: 0.85rem;
    color: #475569;
}
.entete-coordonnees p {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.entete-coordonnees i {
    color: #6366f1;
    width: 16px;
}

/* Responsive */
@media (max-width: 768px) {
    .entete-rapport {
        flex-direction: column;
        text-align: center;
        padding: 20px;
    }
    .entete-logo-droite {
        display: none; /* cache le logo droit sur mobile */
    }
    .entete-coordonnees {
        flex-direction: column;
        gap: 8px;
        align-items: center;
    }
}
        `}
       </style>
        </>
    );
};







