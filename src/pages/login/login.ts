import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController
} from "ionic-angular";
import { HomePage } from "../home/home";
import { Nav, MenuController, Platform } from "ionic-angular";

import { Login } from "../../models/login";
import { AngularFireAuth } from "angularfire2/auth";
import { RegisterUserPage } from "../register-user/register-user";
import * as firebase from "firebase/app";
import { Vibration } from "@ionic-native/vibration";
import { FingerprintAIO } from "@ionic-native/fingerprint-aio";

@IonicPage()
@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  @ViewChild(Nav) nav: Nav;

  pages: Array<{ title: string; component: any }>;
  creds = {} as Login;
  pushPage: any;
  fpScanner: boolean;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private menu: MenuController,
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private vibration: Vibration,
    private faio: FingerprintAIO,
    private platform: Platform
  ) {
    this.pages = [{ title: "homepage", component: HomePage }];
    this.pushPage = RegisterUserPage;
  }

  loginest() {
    this.navCtrl.setRoot(HomePage);
  }

  async loginer() {
    await this.afAuth.auth.signInWithPopup(
      new firebase.auth.GoogleAuthProvider()
    );
    this.navCtrl.setRoot(HomePage);
  }
  async checkAvail() {
    try {
      console.log(this.fpScanner);
      await this.platform.ready();
      const fpAvail = await this.faio.isAvailable();
      console.log(fpAvail);
      if (fpAvail === "OK") {
        this.fpScanner = true;
        console.log(this.fpScanner);
      }
    } catch (e) {
      console.log(e);
    }
  }
  loginfp() {
    this.faio.show({
        clientId: "Fingerprint-Demo",
        clientSecret: "password"
      })
      .then((result: any) => {
        this.vibration.vibrate(250);
        this.navCtrl.setRoot(HomePage);
      })
      .catch((error: any) => {
        console.log("err: ", error);
      });
  }

  ionViewDidEnter() {
    this.menu.swipeEnable(false, "left");
    this.menu.swipeEnable(false, "right");
    this.checkAvail();
    // If you have more than one side menu, use the id like below
    // this.menu.swipeEnable(false, 'menu1');
  }

  ionViewWillLeave() {
    // Don't forget to return the swipe to normal, otherwise
    // the rest of the pages won't be able to swipe to open menu
    this.menu.swipeEnable(true);
  }

  async login(creds: Login) {
    if ((creds.user != null, creds.pass != null)) {
      try {
        const result = await this.afAuth.auth.signInWithEmailAndPassword(
          creds.user,
          creds.pass
        );
        if (result) {
          this.navCtrl.setRoot(HomePage);
        }
      } catch (e) {
        let toast = this.toastCtrl.create({
          message: e,
          duration: 3000,
          position: "top"
        });

          toast.onDidDismiss(() => {
          console.log("Dismissed toast");
        });

       toast.present();
        this.vibration.vibrate(250);
      }
    } else if ((creds.user == null, creds.pass == null)) {
      let toast = this.toastCtrl.create({
        message: "Fields must not be Empty",
        duration: 3000,
        position: "top"
      });

      toast.onDidDismiss(() => {
        console.log("Dismissed toast");
      });

      toast.present();
      this.vibration.vibrate(250);
    }
  }
}
