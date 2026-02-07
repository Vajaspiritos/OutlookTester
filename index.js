import puppeteer from 'puppeteer';

const UN = process.env.OUTLOOK_USERNAME?? "MyPasswordIsTotallyNotMyUsernameBackwards";
const PW = process.env.OUTLOOK_PASSWORD?? "sdrawkcaBemanresUyMtoNyllatoTsIdrowssaPyM";

const Site={
    base:"https://outlook.live.com/owa/",
    login:"https://go.microsoft.com/fwlink/p/?LinkID=2125442&deeplink=mail%2F0%2F",

    get default(){ return this.base},

};


await TestAccount();

async function TestAccount(){
    const Browser = await puppeteer.launch({headless:false});
    const Active_page = await Browser.newPage();

    console.log("Browser started")

    LogIn(Active_page,UN,PW)

   
    await new Promise(resolve => setTimeout(resolve, 30000));
    console.log("closing")
    Browser.close();

}

async function LogIn(page,UN,PW){
     console.log("Commencing login...")

     SafeGoto(page, Site.login)

}


async function SafeGoto(page,url){
    try{
                const response = await page.goto(url,{waitUntil:'networkidle2'});
                if(!response||!response.ok()){
                    throw new Error(`Error loading page.\nResponse: ${response.status()}.\npage:${url}`);
                }else console.log("page successfully loaded.")


                return response;
            }catch(err){
                console.log(err);
                process.exit(1);

            }
}

