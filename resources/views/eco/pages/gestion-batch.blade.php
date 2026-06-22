@include('partials.header')
<script>
    window.currentUser = @json(auth()->user());
    window.userAgences = @json(session('user_agences', []));
    window.currentAgence = @json(session('current_agence'));
</script>
@include('partials.sidebar')
<div class="content-wrapper">
    <section class="content">
        <div class="container-fluid">
            <div class="row" id="gestion-batch">
              <div class="widget-spinner"></div>
            </div>
        </div>
    </section>
</div>

@include('partials.footer')
