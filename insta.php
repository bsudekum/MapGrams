<?php 

    if($_GET['code']) {

        $code = $_GET['code'];

        $url = "https://api.instagram.com/oauth/access_token";

        $access_token_parameters = array(

                'client_id'                =>     'f62cd3b9e9a54a8fb18f7e122abc52df',

                'client_secret'                =>     '801e2f7ee16642bc8c88d33f2b25f610',

                'grant_type'                =>     'authorization_code',

                'redirect_uri'                =>     'http://localhost:8000/',

                'code'                        =>     $code

        );



        // we retrieve the access_token and user's data

        $curl = curl_init($url);

        curl_setopt($curl,CURLOPT_POST,true);

        curl_setopt($curl,CURLOPT_POSTFIELDS,$access_token_parameters);

        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

        $result = curl_exec($curl);

        curl_close($curl);



        $arr = json_decode($result,true);



        $pictureURL = 'https://api.instagram.com/v1/users/'.$arr['user']['id'].'/media/recent?access_token='.$arr['access_token'];



        // to get the user's photos

        $curl = curl_init($pictureURL);

        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

        $pictures = curl_exec($curl);

        curl_close($curl);



        $pics = json_decode($pictures,true);



        // display the url of the last image in standard resolution

        echo $pics['data'][0]['images']['standard_resolution']['url'];



    }



?>