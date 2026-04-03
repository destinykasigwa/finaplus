<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Recuperation;
use Illuminate\Http\Request;
use App\Mail\RecuperationPassword;
use App\Models\ClosedDay;
use App\Models\ExpirateDateConfig;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class Authentication extends Controller
{
    //
    // public function __construct()
    // {
    //     // $this->middleware('auth')->except(['index', 'show']);
    //     // $this->middleware('auth');
    // }



    public function registerIndex()
    {
        return view("auth.register");
    }

    public function loginIndex()
    {
        return view("auth.login");
    }

    public function register(Request $request)
    {

        $validator = validator::make($request->all(), [
            'userName' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required',
            'confirmpassword' => 'required'
            // 'phone' => 'required|max:13|regex:/[0-9]{9}',
            // 'confirmpassword' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'validate_error' => $validator->messages()
            ]);
        }
        if (isset($request->userName) and isset($request->email) and isset($request->password) and isset($request->confirmpassword)) {
            if ($request->password === $request->confirmpassword) {
                // dd($request->password, $request->confirmpassword);
                $passwordHash = Hash::make($request->password);
                $dateDuJour = date("Y-m-d");
                User::create([
                    'name' => $request->userName,
                    'email' => $request->email,
                    'password' =>  $passwordHash,
                    'start_date' => $dateDuJour,

                ]);
                // return redirect('/');
                return response()->json(["status" => 1, "msg" => "Compte crée avec succès."]);
            } else {
                return response()->json(["status" => 0, "msg" => "Vos mots de passe ne correspondent pas."]);
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Veuillez completer tous les champs."]);
        }
    }

    public function login(Request $request)
    {
        $validator = validator::make($request->all(), [
            'name' => 'required',
            'password' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'validate_error' => $validator->messages()
            ]);
        }
        //VERIFIE SI LA JOURNEE N'EST PAS CLOTURE 
        $data = User::where("name", $request->name)->first();
        if ($data and $data->admin == 0) {
            $checkIfDateClosed = ClosedDay::latest()->first();
            if ($checkIfDateClosed and $checkIfDateClosed->closed == 1) {
                return response()->json(["status" => 0, "msg" => "Accès interdit la journée doit être ouverte par l'admin du système."]);
            }
        }
        if ($data and $data->locked_state == 1) {
            return response()->json(["status" => 0, "msg" => "Accès interdit."]);
        }

        if ($data and $data->expirate_password == 1) {
            return response()->json(["status" => 0, "msg" => "Votre mot de passe à expirer veuillez contacter l'administrateur du système."]);
        }

        if (!$data) {
            return response()->json(["status" => 0, "msg" => "Votre nom d'utilisateur n'est pas valide."]);
        }

        // if ($data->reseted_password == 1) {
        //     return redirect("/auth/forget-password");
        // }

        if (Hash::check($request->password, $data->password)) {
            User::where('id', $data->id)->update([
                "attempt_times" => ExpirateDateConfig::first()->login_attempt,
            ]);
            //LOGIC FOR THE PASSWORD EXPIRATE
            $nbrJourExpiration = ExpirateDateConfig::first()->password_expired_days;
            $dateDuChangementPW = $data->start_date;
            $oneDayRemain = $nbrJourExpiration - 1;
            $twoDaysRemain = $nbrJourExpiration - 2;
            $threeDaysRemain = $nbrJourExpiration - 3;
            $fourDaysRemain = $nbrJourExpiration - 4;
            $fiveDaysRemain = $nbrJourExpiration - 5;
            $sixDaysRemain = $nbrJourExpiration - 6;
            $dateAujourd = date("Y-m-d");
            $DateExpiration = date('Y-m-d', strtotime("+" . $nbrJourExpiration . " days", strtotime("$dateDuChangementPW")));
            $oneDay = date('Y-m-d', strtotime("+" . $oneDayRemain . " days", strtotime("$dateDuChangementPW")));
            $twoDays = date('Y-m-d', strtotime("+" . $twoDaysRemain . " days", strtotime("$dateDuChangementPW")));
            $threeDays = date('Y-m-d', strtotime("+" . $threeDaysRemain . " days", strtotime("$dateDuChangementPW")));
            $fourDays = date('Y-m-d', strtotime("+" . $fourDaysRemain . " days", strtotime("$dateDuChangementPW")));
            $fiveDays = date('Y-m-d', strtotime("+" . $fiveDaysRemain . " days", strtotime("$dateDuChangementPW")));
            $sixDays = date('Y-m-d', strtotime("+" . $sixDaysRemain . " days", strtotime("$dateDuChangementPW")));
            //dd($DateExpiration);

            if ($dateAujourd == $DateExpiration) {
                User::where('id', $data->id)->update([
                    "expirate_password" => 1,
                ]);

                return response()->json(["status" => 0, "msg" => "Votre mot de passe à expirer veuillez contacter votre administrateur système."]);
            } else if ($dateAujourd == $oneDay) {
                return response()->json(["status" => "password_expired", "msg" => "Votre mot de passe expire dans un jour."]);
            } else if ($dateAujourd == $twoDays) {
                return response()->json(["status" => "password_expired", "msg" => "Votre mot de passe expire dans deux jour."]);
            } else if ($dateAujourd == $threeDays) {

                return response()->json(["status" => "password_expired", "msg" => "Votre mot de passe expire dans trois jour."]);
            } else if ($dateAujourd == $fourDays) {
                return response()->json(["status" => "password_expired", "msg" => "Votre mot de passe expire dans quatre jour."]);
            } else if ($dateAujourd == $fiveDays) {
                return response()->json(["status" => "password_expired", "msg" => "Votre mot de passe expire dans cinq jour."]);
            } else if ($dateAujourd == $sixDays) {
                return response()->json(["status" => "password_expired", "msg" => "Votre mot de passe expire dans six jour."]);
            }
        } else {
            User::where('id', $data->id)->update([
                "attempt_times" => $data->attempt_times - 1,
            ]);
            $attempt_times = User::where('id', $data->id)->first()->attempt_times;
            if ($attempt_times == 0) {
                User::where('id', $data->id)->update([
                    "locked_state" => 1
                ]);
                return response()->json(["status" => 0, "msg" => "Vous êtes désactivé suite à plusieurs tentatives de connexion incorrecte veuillez contacter votre administrateur système."]);
            }
            return response()->json(["status" => 0, "msg" => "Votre mot de passe ne pas valide il vous reste " . $attempt_times . " tentatives"]);
        }

        if (auth()->attempt($request->only('name', 'password'))) {
            session('returnUrl');
            session()->forget('returnUrl');


            return response()->json(["status" => 1, "data" => $data]);
        } else {
            return response()->json(["status" => 0, "msg" => "Les identifiants ne correspondent pas"]);
        }
    }

    public function logout()
    {
        auth()->logout();
        session(['returnUrl' => url()->previous()]);
        return redirect("/auth/login");
    }

    //RECUPERATION PASSWORD HOME PAGE 

    public function recuperationHomePage()
    {
        return view("auth.forget-password");
    }

    //ALLOW TO RESET PASSWORD



    public function resetHomePage()
    {
        return view("auth.reset-password");
    }

    //RECUPERATION PASSWORD STEP ONE
    public function recuperationPasswordStepOne(Request $request)
    {

        $validator = validator::make($request->all(), [
            'email' => 'required|email',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'validate_error' => $validator->messages()
            ]);
        }

        $user = User::where("email", "=", $request->email)->first();
        if ($user) {
            if ($user->expirate_password == 1) {
                return response()->json(["status" => 0, "msg" => "Votre mot de passe à expirer veuillez vous devez contacter votre admninistrateur système."]);
            }
            $code = random_int(100000, 999999);
            Recuperation::create([
                "email" => $user->email,
                "random_int" => $code,
            ]);
            $data = "Bonjour " . $user->name . " Voici le code pour récuperer votre compte.";
            Mail::to($user->email)->send(new RecuperationPassword($user, $data, $code));
            // return Redirect::route('recuperation-password', ["action" => "recuperation-step-one", "email" => $user->email, "successMessage" => " vous y êtes presque Un code vous a été envoyé par mail veuillez le renseigner dans le champ prévu."]);
            return response()->json(["status" => 1]);
        } else {
            return response()->json(["status" => 0, "msg" => "Votre adresse email n'est pas enregistrée."]);
        }

        // return response()->json($request->all());
    }


    //RECUPERATION PASSWORD STEP TWO

    public function recuperationPasswordStepTwo(Request $request)
    {

        $validator = validator::make($request->all(), [
            'code_recuperation' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'validate_error' => $validator->messages()
            ]);
        }
        $code = Recuperation::where("random_int", "=", $request->code_recuperation)->first();

        if ($code) {

            return response()->json(["status" => 1]);
        } else {

            return response()->json(["status" => 0, "msg" => "Code incorrect veuillez réessayer !"]);
        }
    }


    //RECUPERATION PASSWORD STEP 3

    public function recuperationPasswordStepThree(Request $request)
    {

        $validator = validator::make($request->all(), [
            'password' => 'required',
            'password_confirm' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'validate_error' => $validator->messages()
            ]);
        }
        if ($request->password === $request->password_confirm) {
            $passwordHash = Hash::make($request->password);
            $todayDate = date("Y-m-d");
            $nbrJourExpiration = ExpirateDateConfig::first()->password_expired_days;
            // $dateDuChangementPW =  $todayDate;
            //$DateExpiration = date('Y-m-d', strtotime("+" . $nbrJourExpiration . " days", strtotime("$dateDuChangementPW")));
            $DateExpiration = date("Y-m-d", strtotime($todayDate . " +$nbrJourExpiration days"));
            User::where("email", "=", $request->email)->update([
                "password" => $passwordHash,
                "start_date" => $todayDate,
                "expirate_date" => $DateExpiration,
                "attempt_times" => 6,
                "reseted_password" => 0
            ]);
            Recuperation::where("email", $request->email)->delete();
            return response()->json(["status" => 1]);
        } else {
            return response()->json(["status" => 0]);
        }
    }

    //CHANGE PASSWORD BY USER WHEN IT'S EXPIRED
    public function ChangePassWordByUser(Request $request)
    {
        $validator = validator::make($request->all(), [
            'Previouspassword' => 'required',
            'newPassword' => 'required',
            'confirmNewPassword' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'validate_error' => $validator->messages()
            ]);
        }

        if ($request->newPassword == $request->confirmNewPassword) {

            $data = User::where("name", $request->name)->first();
            $passwordHash = Hash::make($request->newPassword);
            if (Hash::check($request->Previouspassword, $data->password)) {
                $todayDate = date("Y-m-d");
                $nbrJourExpiration = ExpirateDateConfig::first()->password_expired_days;
                // $dateDuChangementPW = $data->start_date;
                $DateExpiration = date("Y-m-d", strtotime($todayDate . " +$nbrJourExpiration days"));
                // $DateExpiration = date('Y-m-d', strtotime("+" . $nbrJourExpiration . " days", strtotime("$dateDuChangementPW")));
                if (!Hash::check($request->newPassword, $data->password)) {
                    User::where("id", $data->id)->update([
                        "password" => $passwordHash,
                        "start_date" => $todayDate,
                        "expirate_date" => $DateExpiration,
                        "reseted_password" => 0
                    ]);
                    if (auth()->attempt(['name' => $request->name, 'password' => $request->newPassword])) {
                        return response()->json(["status" => 1]);
                    }
                } else {
                    return response()->json(["status" => 0, "msg" => "Le nouveau mot de passe ne doit pas être identique à l'ancien."]);
                }
            } else {
                return response()->json(["status" => 0, "msg" => "L'ancien mot de passe ne pas valide."]);
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Vos mots de passe ne sont pas identiques."]);
        }
    }

    //PERMET D'IGNORER LE CHANGEMENT DU MOT DE PASSE QD IL A DEJA EXPIRER
    public function skipPasswordIndex()
    {
        return view("auth.skip-change-password");
    }
    public function LoginSkipPassword(Request $request)
    {


        // return response()->json([$request->all()]);
        if (auth()->attempt($request->only('name', 'password'))) {
            return response()->json(["status" => 1]);
        } else {
            return response()->json(["status" => 0, "msg" => "Les identifiants ne correspondent pas"]);
        }
    }

    public function ResetPassWordByUser(Request $request)
    {

        $validator = validator::make($request->all(), [
            'password' => 'required',
            'password_confirm' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'validate_error' => $validator->messages()
            ]);
        }

        if ($request->password == $request->password_confirm) {

            $data = User::where("id", $request->userId)->first();
            $passwordHash = Hash::make($request->password);

            $todayDate = date("Y-m-d");
            $nbrJourExpiration = ExpirateDateConfig::first()->password_expired_days;
            // $dateDuChangementPW = $data->start_date;
            $DateExpiration = date("Y-m-d", strtotime($todayDate . " +$nbrJourExpiration days"));
            // $DateExpiration = date('Y-m-d', strtotime("+" . $nbrJourExpiration . " days", strtotime("$dateDuChangementPW")));
            if (!Hash::check($request->password, $data->password)) {
                User::where("id", $data->id)->update([
                    "password" => $passwordHash,
                    "start_date" => $todayDate,
                    "expirate_date" => $DateExpiration,
                    "reseted_password" => 0
                ]);
                if (auth()->attempt(['id' => $request->userId, 'password' => $request->password])) {
                    return response()->json(["status" => 1]);
                }
            } else {
                return response()->json(["status" => 0, "msg" => "Le nouveau mot de passe ne doit pas être identique à l'ancien."]);
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Vos mots de passe ne sont pas identiques."]);
        }
    }
}
