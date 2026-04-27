import React, { useState, useEffect } from "react";
import axios from "axios";

export const EnteteBordereau = () => {
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
        return <div className="entete-placeholder" />;
    }

    return (
        <>
            <div className="entete-rapport">
                <div className="entete-logo">
                    {/* <img
                        src={`https://app.ihdemunis.org/uploads/images/logo/1696413083.jpg`}
                        alt="Logo"
                    /> */}
                       <img
                        src={`https://app.nuru.clindrc.com/uploads/images/logo/1736022909.PNG`}
                        alt="Logo"
                    />
                </div>
                <div className="entete-infos">
                    <div className="entete-denomination">
                        {data.denomination}
                    </div>
                    <div className="entete-sigle">{data.sigle}</div>
                    <div className="entete-coordonnees">
                        <span>
                            {data.ville}, {data.pays}
                        </span>
                        <span>{data.tel}</span>
                        <span>{data.email}</span>
                    </div>
                </div>
            </div>

            <style>{`
                /* Styles par défaut pour l'écran (inchangés) */
                .entete-rapport {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: white;
                    border-radius: 24px;
                    padding: 20px 30px;
                    margin-bottom: 24px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
                    border: 1px solid #eef2ff;
                    flex-wrap: wrap;
                    gap: 20px;
                }
                .entete-logo img {
                    height: 80px;
                    width: auto;
                    max-width: 150px;
                }
                .entete-denomination {
                    font-size: 1.6rem;
                    font-weight: 700;
                }
                .entete-sigle {
                    font-size: 1.2rem;
                    color: #0f766e;
                }
                .entete-coordonnees {
                    display: flex;
                    gap: 24px;
                    font-size: 0.85rem;
                }

                /* STYLES ULTRA COMPACTS POUR L'IMPRESSION A5 */
               @media print {
    .entete-rapport {
        all: unset;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;      /* centrage horizontal */
        justify-content: flex-start !important;
        gap: 2px !important;
        padding: 2px 0 !important;
        margin: 0 0 2px 0 !important;
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
        width: 100% !important;
    }
    .entete-logo {
        display: block !important;
        text-align: center !important;
        margin: 0 auto !important;            /* centrage supplémentaire */
        margin-bottom: 2px !important;
    }
    .entete-logo img {
        height: 30px !important;              /* taille visible */
        width: auto !important;
        max-width: 80px !important;
        display: block !important;
        margin: 0 auto !important;            /* centrage de l’image */
    }
    .entete-infos {
        text-align: center !important;
        line-height: 1.2 !important;
        width: 100% !important;
    }
    .entete-denomination {
        font-size: 8pt !important;
        font-weight: bold !important;
        margin: 0 !important;
    }
    .entete-sigle {
        font-size: 7pt !important;
        margin: 0 !important;
        color: #0f766e !important;
    }
    .entete-coordonnees {
        display: flex !important;
        flex-wrap: wrap !important;
        justify-content: center !important;
        gap: 4px !important;
        font-size: 5pt !important;
        margin-top: 1px !important;
    }
    .entete-coordonnees span {
        margin: 0 !important;
    }
    /* Si vous aviez des icônes FontAwesome, on les cache */
    .entete-coordonnees i {
        display: none !important;
    }
}


@media print {
    .entete-rapport {
        all: unset;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 1px !important;           /* espace réduit entre logo et texte */
        padding: 1px 0 !important;     /* moins de padding vertical */
        margin: 0 0 1px 0 !important;  /* marge basse minimale */
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
        width: 100% !important;
    }
    .entete-logo {
        display: block !important;
        text-align: center !important;
        margin: 0 auto !important;
        margin-bottom: 1px !important;  /* espace sous le logo réduit */
    }
    .entete-logo img {
        height: 20px !important;        /* logo plus petit (20px au lieu de 30) */
        width: auto !important;
        max-width: 60px !important;
        display: block !important;
        margin: 0 auto !important;
    }
    .entete-infos {
        text-align: center !important;
        line-height: 1.1 !important;    /* interligne plus serré */
        width: 100% !important;
    }
    .entete-denomination {
        font-size: 7pt !important;      /* légèrement réduit */
        font-weight: bold !important;
        margin: 0 !important;
    }
    .entete-sigle {
        font-size: 6pt !important;
        margin: 0 !important;
        color: #0f766e !important;
    }
    .entete-coordonnees {
        display: flex !important;
        flex-wrap: wrap !important;
        justify-content: center !important;
        gap: 3px !important;
        font-size: 5pt !important;
        margin-top: 0 !important;       /* supprimer la marge haute */
    }
    .entete-coordonnees span {
        margin: 0 !important;
    }
    .entete-coordonnees i {
        display: none !important;
    }
}
            `}</style>
        </>
    );
};
