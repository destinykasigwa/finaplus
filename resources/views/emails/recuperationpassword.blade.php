<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>AKIBA YETU - Récupération de mot de passe</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            background-color: #f4f7fb;
            margin: 0;
            padding: 20px;
        }
        
        .email-container {
            max-width: 650px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }
        
        /* Header avec dégradé */
        .email-header {
            background: linear-gradient(135deg, #024443 0%, #026d6c 100%);
            padding: 30px 30px 25px;
            text-align: center;
            position: relative;
        }
        
        .logo-container {
            background: white;
            display: inline-block;
            padding: 10px 20px;
            border-radius: 16px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .logo-container img {
            max-width: 180px;
            height: auto;
            display: block;
        }
        
        .email-header h1 {
            color: white;
            font-size: 28px;
            margin: 20px 0 0;
            font-weight: 600;
            letter-spacing: -0.5px;
        }
        
        .email-header .badge {
            display: inline-block;
            background: #B58932;
            color: white;
            padding: 6px 16px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 500;
            margin-top: 12px;
        }
        
        /* Corps de l'email */
        .email-body {
            padding: 35px 30px;
        }
        
        .greeting {
            background: #f8f9fc;
            padding: 20px;
            border-radius: 16px;
            margin-bottom: 25px;
            border-left: 4px solid #B58932;
        }
        
        .greeting p {
            margin: 0;
            font-size: 15px;
            color: #2c3e50;
            line-height: 1.5;
        }
        
        .greeting strong {
            color: #024443;
            font-size: 16px;
        }
        
        /* Code Card */
        .code-card {
            background: linear-gradient(135deg, #fef9e8 0%, #fff5e0 100%);
            border-radius: 20px;
            padding: 30px;
            margin: 25px 0;
            text-align: center;
            border: 1px solid #f0e4c5;
        }
        
        .code-label {
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #B58932;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .code-value {
            font-size: 48px;
            font-weight: 800;
            color: #024443;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background: white;
            display: inline-block;
            padding: 15px 30px;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 2px dashed #B58932;
        }
        
        /* Message Box */
        .message-box {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 16px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .message-box p {
            margin: 0;
            font-size: 14px;
            line-height: 1.6;
            color: #2c3e50;
        }
        
        /* Info Box */
        .info-box {
            background: #e8f4f3;
            border-radius: 12px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        
        .info-box i {
            color: #B58932;
            font-size: 20px;
            margin-bottom: 8px;
            display: inline-block;
        }
        
        .info-box p {
            margin: 0;
            font-size: 13px;
            color: #024443;
        }
        
        /* Warning Box */
        .warning-box {
            background: #fff5e6;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 12px;
        }
        
        .warning-box p {
            margin: 0;
            font-size: 13px;
            color: #92400e;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .warning-box i {
            color: #f59e0b;
            font-size: 16px;
        }
        
        /* Button */
        .action-button {
            text-align: center;
            margin: 25px 0;
        }
        
        .btn-primary {
            display: inline-block;
            background: linear-gradient(135deg, #B58932 0%, #d4a143 100%);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 40px;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(181, 137, 50, 0.3);
        }
        
        /* Contact Section */
        .contact-section {
            background: #f8fafc;
            border-radius: 16px;
            padding: 25px;
            margin-top: 30px;
            border: 1px solid #e9ecef;
        }
        
        .contact-section h3 {
            color: #024443;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .contact-section h3 i {
            color: #B58932;
        }
        
        .contact-details {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .contact-item {
            flex: 1;
            min-width: 200px;
        }
        
        .contact-item .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #7f8c8d;
            margin-bottom: 5px;
            font-weight: 600;
        }
        
        .contact-item .value {
            color: #2c3e50;
            font-size: 14px;
            font-weight: 500;
        }
        
        .contact-item .value a {
            color: #B58932;
            text-decoration: none;
        }
        
        .contact-item .value a:hover {
            text-decoration: underline;
        }
        
        /* Footer */
        .email-footer {
            background: #f8fafc;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .social-links {
            margin-bottom: 15px;
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
            width: 36px;
            height: 36px;
            border-radius: 50%;
        }
        
        .copyright {
            font-size: 12px;
            color: #95a5a6;
            margin-top: 15px;
        }
        
        /* Responsive */
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-container {
                border-radius: 16px;
            }
            
            .email-header {
                padding: 20px;
            }
            
            .email-header h1 {
                font-size: 22px;
            }
            
            .logo-container img {
                max-width: 140px;
            }
            
            .email-body {
                padding: 20px;
            }
            
            .code-value {
                font-size: 28px;
                letter-spacing: 4px;
                padding: 10px 20px;
            }
            
            .contact-details {
                flex-direction: column;
                gap: 12px;
            }
            
            .social-links img {
                width: 32px;
                height: 32px;
            }
        }
        
        /* Support des clients email */
        .ExternalClass, .ReadMsgBody {
            width: 100%;
            background-color: #f4f7fb;
        }
        
        table, td {
            border-collapse: collapse;
        }
    </style>
</head>

<body style="margin: 0; padding: 20px; background-color: #f4f7fb;">
    <div class="email-container">
        <!-- Header avec logo et dégradé -->
        <div class="email-header">
            <div class="logo-container">
                <img src="https://ihdemunis.org/images/logo_clean2_white__2_-removebg-preview.png" alt="COOPEC AKIBA YETU">
            </div>
            <h1>Récupération de mot de passe</h1>
            <div class="badge">
                🔐 Sécurité de votre compte
            </div>
        </div>
        
        <!-- Corps de l'email -->
        <div class="email-body">
            <!-- Message de bienvenue -->
            <div class="greeting">
                <p>
                    <strong>Bonjour,</strong><br>
                    Vous avez demandé la réinitialisation de votre mot de passe. 
                    Veuillez utiliser le code ci-dessous pour procéder à la modification.
                </p>
            </div>
            
            <!-- Message personnalisé -->
            @if(isset($data))
                <div class="message-box">
                    <p>{{ $data }}</p>
                </div>
            @endif
            
            <!-- Code de récupération -->
            <div class="code-card">
                <div class="code-label">
                    <i class="fas fa-key"></i> Votre code de récupération
                </div>
                <div class="code-value">
                    {{ $code }}
                </div>
                <div class="info-box" style="margin-top: 20px; background: transparent;">
                    <p>Ce code est valable pendant <strong>15 minutes</strong></p>
                </div>
            </div>
            
            <!-- Instructions -->
            <div class="warning-box">
                <p>
                    <i class="fas fa-shield-alt"></i>
                    <strong>Conseil de sécurité :</strong> Ne partagez jamais ce code avec personne. 
                    Notre équipe ne vous demandera jamais votre code par téléphone ou email.
                </p>
            </div>
            
            <!-- Bouton d'action -->
            <div class="action-button">
                <a href="https://app.ihdemunis.org/auth/recuperation" class="btn-primary">
                    <i class="fas fa-arrow-right"></i> Réinitialiser mon mot de passe
                </a>
            </div>
            
            <!-- Information complémentaire -->
            <div class="info-box">
                <i class="fas fa-envelope"></i>
                <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email ou contacter notre support.</p>
            </div>
            
            <!-- Section contact -->
            <div class="contact-section">
                <h3>
                    <i class="fas fa-headset"></i>
                    Besoin d'assistance ?
                </h3>
                <div class="contact-details">
                    <div class="contact-item">
                        <div class="label">Adresse</div>
                        <div class="value">
                            61 Av. de la Conférence, Q. Kyeshero, <br>
                             ville de Goma, Commune de Goma <br> (derrière l'hopital CBCA Ndosho). <br>
                             Courriel: initiativedemunis2012@gmail.com
                            Avenue MONT GOMA N°13, Quartier Les Volcans<br>
                            Nord Kivu
                            République Démocratique du Congo
                        </div>
                    </div>
                    <div class="contact-item">
                        <div class="label">Téléphone</div>
                        <div class="value">
                            <a href="tel:+243999743253">+243 999 743 253</a>
                        </div>
                    </div>
                    <div class="contact-item">
                        <div class="label">Email</div>
                        <div class="value">
                            <a href="mailto:contact@ihdemunis.org">contact@ihdemunis.org</a><br>
                            <a href="mailto:ihdemunis@ihdemunis.org">ihdemunis@ihdemunis.org</a>
                        </div>
                    </div>
                    <div class="contact-item">
                        <div class="label">Site web</div>
                        <div class="value">
                            <a href="https://www.coopecakibayetu.org">www.ihdemunis.org</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer avec réseaux sociaux -->
        <div class="email-footer">
            <div class="social-links">
                <a href="https://www.facebook.com/COOPEC-AKIBA-YETU-100747979154529/" target="_blank">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook">
                </a>
                <a href="#" target="_blank">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn">
                </a>
                <a href="#" target="_blank">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg" alt="Twitter">
                </a>
            </div>
            <div class="copyright">
                © {{ date('Y') }} IHDEMUNSI ASBL - Tous droits réservés<br>
                Ce message est automatique, merci de ne pas y répondre directement.
            </div>
        </div>
    </div>
</body>
</html>
