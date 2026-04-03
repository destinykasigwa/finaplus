import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
export const EnteteBordereau = () => {
    const [data, setData] = useState();

    const getData = async () => {
        const res = await axios.get("/eco/page/header-report");
        if (res.data.status == 1) {
            setData(res.data.data);
        }
    };
    useEffect(() => {
        getData();
    }, []);

    return (
        <div
            style={{
                margin: "0 auto",
                width: "77%",
                border: "0px",
            }}
            className="main-entente-container"
        >
            {" "}
            <br />
            <br />
            <div
                style={{
                    textAlign: "center",
                }}
            >
                <h6>
                    <b>{data && data.denomination}</b>
                </h6>
            </div>
            <table id="table" class="table entente-container" align="center">
                <tr>
                    <td style={{ border: "0px" }}>
                        {" "}
                        <img
                            style={{
                                width: "100%",
                                height: "90px",
                            }}
                            src={`https://app.ihdemunis.org/uploads/images/logo/1696413083.jpg`}
                        />
                    </td>
                    <td
                        style={{
                            border: "0px",
                        }}
                    >
                        <div
                            style={{
                                textAlign: "center",
                            }}
                        >
                            <h3>«{data && data.sigle}»</h3>
                            <p>
                                {data && data.ville} {data && data.pays} <br />
                                Téléphone: {data && data.tel} <br />
                                Courriel: {data && data.email} <br />
                            </p>
                        </div>
                    </td>
                    <td align="right" style={{ border: "0px" }}>
                        <div
                            style={{
                                marginLeft: "0px",
                            }}
                        >
                            <h4>
                                <b>
                                    <img
                                        style={{
                                            width: "100%",
                                            height: "90px",
                                        }}
                                        src={`https://app.ihdemunis.org/uploads/images/logo/1696413083.jpg`}
                                    />
                                </b>
                            </h4>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    );
};
