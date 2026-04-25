<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>IHDEMUNIS ASBL </title>
    <style>
        /* Reset et styles de base pour les clients email */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            background-color: #f4f7fb;
            margin: 0;
            padding: 20px 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.1);
        }

        /* Header avec le nouveau logo */
        .header {
            background: linear-gradient(135deg, #013c3b 0%, #016b68 100%);
            padding: 32px 24px;
            text-align: center;
        }

        .logo {
            max-width: 180px;
            width: 100%;
            height: auto;
            margin-bottom: 16px;
        }

        .header h1 {
            color: white;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            letter-spacing: -0.3px;
        }

        .header p {
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
            margin-top: 8px;
        }

        /* Corps du message */
        .content {
            padding: 32px 28px;
            background: white;
        }

        .message-card {
            background-color: #f9fafc;
            border-left: 4px solid #016b68;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 32px;
            font-size: 16px;
            color: #1f2d3d;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        /* Infos de contact */
        .info-section {
            margin-bottom: 28px;
        }

        .info-title {
            font-weight: 700;
            font-size: 18px;
            color: #013c3b;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .info-title:before {
            content: "馃搷";
            font-size: 20px;
        }

        .info-title.contacts:before {
            content: "馃摓";
        }

        .address-block, .contacts-block {
            background: #f8f9fa;
            padding: 16px 20px;
            border-radius: 16px;
            margin-bottom: 20px;
            font-size: 15px;
            color: #2c3e4e;
            line-height: 1.5;
        }

        .contacts-block a {
            color: #016b68;
            text-decoration: none;
            font-weight: 500;
            word-break: break-all;
        }

        .contacts-block a:hover {
            text-decoration: underline;
        }

        /* R茅seaux sociaux */
        .social-links {
            text-align: center;
            margin: 30px 0 20px;
            padding: 20px 0 10px;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
        }

        .social-links a {
            display: inline-block;
            margin: 0 8px;
            transition: transform 0.2s ease;
        }

        .social-links a:hover {
            transform: translateY(-2px);
        }

        .social-links img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            background-color: white;
        }

        /* Footer automatique */
        .footer-note {
            background-color: #f1f5f9;
            padding: 18px 24px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }

        .footer-note strong {
            color: #016b68;
            font-weight: 600;
        }

        /* Responsive */
        @media (max-width: 600px) {
            .content {
                padding: 24px 20px;
            }
            .address-block, .contacts-block {
                padding: 14px 16px;
            }
            .logo {
                max-width: 140px;
            }
            .social-links img {
                width: 36px;
                height: 36px;
            }
        }

        /* support anciens clients email */
        table {
            width: 100%;
        }
        .fallback-table {
            width: 100%;
            border-collapse: collapse;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <!-- Header avec le nouveau logo -->
        <div class="header">
            <img src="https://ihdemunis.org/images/logo_clean2_white__2_-removebg-preview.png" alt="IHDEMUNIS ASBL Logo" class="logo">
            <h1>IHDEMUNIS ASBL</h1>
            <p>Initiative Humanitaire pour les Demunis</p>
        </div>

        <!-- Contenu principal -->
        <div class="content">
            <!-- Message dynamique (peut contenir nom, r么le, etc.) -->
            <div class="message-card">
                {{-- <p>Bonjour {{ $user->name }}, votre r么le est {{ $user->Role }}</p> --}}
                <p>{!! nl2br(e($data)) !!}</p>
            </div>

            <!-- Coordonns -->
            <div class="info-section">
                <div class="address-block">
                    <div class="info-title">Adresse</div>
                    61 Av. de la Conférence, Q. Kyeshero, ville de Goma<br>
                    Commune de Goma (derrière l'hôpital CBCA Ndosho)
                </div>

                <div class="contacts-block">
                    <div class="info-title contacts">Contacts</div>
                     Site web : <a href="https://www.ihdemunis.org">www.ihdemunis.org</a><br>
                     Tél : <a href="tel:+243999743253">+243 999 743 253</a><br>
                    Courriel : <a href="mailto:initiativedemunis2012@gmail.com">initiativedemunis2012@gmail.com</a>
                </div>
            </div>

            <!-- R茅seaux sociaux (liens 脿 personnaliser) -->
            <div class="social-links">
                <a href="#" aria-label="Facebook"><img src="https://ihdemunis.org/images/facebook.png" alt="Facebook"></a>
                <a href="#" aria-label="LinkedIn"><img src="https://ihdemunis.org/images/linkedin.png" alt="LinkedIn"></a>
                <a href="#" aria-label="Twitter"><img src="https://ihdemunis.org/images/twitter_1.png" alt="Twitter"></a>
            </div>
        </div>

        <!-- Pied de page automatique -->
        <div class="footer-note">
            <p>Ce message vous a envoyé automatiquement depuis l'application <strong>EpargnePro</strong>.<br>
            Merci de ne pas répondre à cet email.</p>
            <p style="margin-top: 8px; font-size: 11px;">&copy; {{ date('Y') }} IHDEMUNIS ASBL - Tous droits réservés.</p>
        </div>
    </div>
</body>

</html>