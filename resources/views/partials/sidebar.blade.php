<!-- Main Sidebar Container -->
<aside class="main-sidebar sidebar-dark-primary elevation-4" style="background: #000;position:fixed">
    <div class="sidebar">
        <!-- Logo et branding -->
        <div class="user-panel mt-3 pb-3 mb-3 d-flex align-items-center justify-content-center border-bottom border-secondary">
            <div class="info text-center">
                <a href="eco/home" class="d-block text-light" style="text-decoration: none;">
                    <div class="d-flex align-items-center justify-content-center mb-2">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #20c997, #198764); 
                                    border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-chart-line" style="font-size: 20px; color: white;"></i>
                        </div>
                    </div>
                    <strong style="font-size: 24px; background: linear-gradient(135deg, #20c997, #198764); 
                                   -webkit-background-clip: text; background-clip: text; color: transparent;">
                        FinaPlus
                    </strong>
                    <small class="d-block text-muted mt-1" style="font-size: 11px;">Gestion financière</small>
                </a>
            </div>
        </div>

        <nav class="mt-2">
            <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                <!-- CAISSE -->
                @if ($isCaissier)
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="fas fa-money-bill-wave"></i>
                            <p>
                                CAISSE
                                <i class="right fas fa-angle-left"></i>
                            </p>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.depot-espece') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Dépot</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.visa') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Visa</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.retrait-espece') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Retrait</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.delestage') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Délestage</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.repertoire') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Repertoire</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.releve') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Relevé</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.appro') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Appro</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.suspens') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Suspens</p>
                                </a>
                            </li>
                        </ul>
                    </li>
                @endif

                <!-- TRESOR -->
                @if ($isChefCaisse)
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="fas fa-landmark"></i>
                            <p>
                                TRESOR
                                <i class="right fas fa-angle-left"></i>
                            </p>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.entreeT') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Entrée T</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.repertoire') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Repertoire</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.releve') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Relevé</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.appro') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Appro</p>
                                </a>
                            </li>
                        </ul>
                    </li>
                @endif

                <!-- COMPTABILITE -->
                @if ($isComptable)
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="fas fa-calculator"></i>
                            <p>
                                COMPTABILITE
                                <i class="right fas fa-angle-left"></i>
                            </p>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.debiter') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Opérations comptables</p>
                                </a>
                            </li>
                        </ul>
                    </li>
                @endif

                <!-- GESTION CREDIT -->
                @if ($isAgentCredit)
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="fas fa-chart-line"></i>
                            <p>
                                GESTION CREDIT
                                <i class="right fas fa-angle-left"></i>
                            </p>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.montage-credit') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Montage crédit</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.type-credit') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Type de crédit</p>
                                </a>
                            </li>
                        </ul>
                    </li>
                @endif

                <!-- CLIENTELLE -->
                @if ($isAgentClientele)
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="fas fa-users"></i>
                            <p>
                                CLIENTELLE
                                <i class="fas fa-angle-left right"></i>
                            </p>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.adhesion-membre') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Adhésion</p>
                                </a>
                            </li>
                        </ul>
                    </li>
                @endif

                <!-- RAPPORT -->
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <i class="fas fa-chart-pie"></i>
                        <p>
                            RAPPORT
                            <i class="fas fa-angle-left right"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item">
                            <a href="{{ route('eco.pages.journal') }}" class="nav-link">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Journal</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('eco.pages.repertoire') }}" class="nav-link">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Repertoire</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('eco.pages.releve') }}" class="nav-link">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Relevé de compte</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('eco.pages.balance') }}" class="nav-link">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Balance</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('eco.pages.bilan') }}" class="nav-link">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Bilan</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('eco.pages.tfr') }}" class="nav-link">
                                <i class="far fa-circle nav-icon"></i>
                                <p>TFR</p>
                            </a>
                        </li>
                    </ul>
                </li>

                <!-- ADMINISTRATION -->
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <i class="fas fa-cogs"></i>
                        <p>
                            Admnistration
                            <i class="fas fa-angle-left right"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item">
                            <a href="{{ route('eco.pages.cloture') }}" class="nav-link">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Clôture & Ouverture</p>
                            </a>
                        </li>
                    </ul>
                </li>

                <li class="nav-header">----------------------------------</li>

                <!-- PARAMETRE (IT only) -->
                @if ($isIT)
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="fas fa-sliders-h"></i>
                            <p>
                                Paramètre
                                <i class="fas fa-angle-left right"></i>
                            </p>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.utilisateurs') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Utilisateurs</p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="{{ route('eco.pages.compte-param') }}" class="nav-link">
                                    <i class="far fa-circle nav-icon"></i>
                                    <p>Paramètres généraux</p>
                                </a>
                            </li>
                        </ul>
                    </li>
                @endif
            </ul>
        </nav>
    </div>
</aside>