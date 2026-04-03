{{-- @include('partials.header')
@include('partials.sidebar') --}}
<link rel="stylesheet" href="{{ asset('css/style.css') }}">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
    integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">

<body style="background-image: url({{ asset('images/bg3.jpeg') }});background-repeat: no-repeat;
background-size: 100%;">


    <div id="app" class="h-100 d-flex align-items-center justify-content-center">
        <div class="row">
            <div class="col-md-4">
                <section>
                    <article class="timeline">
                        <a href="{{ route('eco.home') }}">
                            <div class="colonne">
                                <div class="text-content">FINANCE</div>
                                <div class="last"><img src="{{ asset('images/bigtontine.png') }}" alt="">
                                </div>
                            </div>
                        </a>
                        <a href="">
                            <div class="colonne">
                                <div>COMMERCE</div>
                                <div class="last"><img src="{{ asset('images/bigtontine.png') }}" alt="">
                                </div>

                            </div>
                        </a>
                        <a href="">
                            <div class="colonne">
                                <div>DIVERTISSEMENT</div>
                                <div class="last"><img src="{{ asset('images/bigtontine.png') }}" alt="">
                                </div>
                            </div>
                        </a>
                        {{-- <a href="">
                            <div class="colonne">
                                <div>Paie</div>
                                <div class="last"><img src="{{ asset('images/bigtontine.png') }}" alt="">
                                </div>
                            </div>
                        </a> --}}
                        {{-- <div class="colonne">
                        <div>texte</div>
                        <div class="last">3</div>
                    </div>
                    <div class="colonne">
                        <div>texte</div>
                        <div class="last">3</div>        
                    </div> --}}
                        {{-- <div class="choisir">
                    choisir<br />mes articles
                </div> --}}
                    </article>
                </section>


                {{-- <div class='circle-container'>
        <a href='#' class='center'><img src='images/bigtontine.png'></a>
        <a href='#' class='deg0'><img src='{{ asset('images/bigtontine.png') }}'>STOCK</a>
        <a href='#' class='deg45'><img src='{{ asset('images/bigtontine.png') }}'>Gestion <br> de stock</a>
        <a href='#' class='deg160'><img src='{{ asset('images/bigtontine.png') }}'>TEXT</a>
        <a href='#' class='deg180'><img src='{{ asset('images/bigtontine.png') }}'>TEXT</a>
        <a href='#' class='deg225'><img src='{{ asset('images/bigtontine.png') }}'>TEXT</a>
        <a href='#' class='deg315'><img src='{{ asset('images/bigtontine.png') }}'>TEXT</a>
        <a href='#' class='deg270'><img src='{{ asset('images/bigtontine.png') }}'>TEXT</a>
        <a href='#' class='deg100'><img src='{{ asset('images/bigtontine.png') }}'>TEXT</a>
        <a href='#' class='deg150'><img src='{{ asset('images/bigtontine.png') }}'>TEXT</a>
    </div> --}}
            </div>
        </div>
    </div>
</body>
{{-- @include('partials.footer') --}}
