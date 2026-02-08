import puppeteer from 'puppeteer';

const EM = process.env.OUTLOOK_EMAIL?? "MyPasswordIsTotallyNotMyUsernameBackwards@outlook.hu";
const PW = process.env.OUTLOOK_PASSWORD?? "sdrawkcaBemanresUyMtoNyllatoTsIdrowssaPyM";

const Site={
    base:"https://outlook.live.com/mail/0/",
    login:"https://go.microsoft.com/fwlink/p/?LinkID=2125442"
};

const Email={
    address:"gugla9@gmail.com",
    subject:"Teszt tárgy",
    text:"Ez egy teszt üzenet."
}


await TestAccount();

async function TestAccount(){
    const Browser = await puppeteer.launch({headless:false});
    const Active_page = await Browser.newPage();

    console.log("Browser started")

    await LogIn(Active_page)
    console.log("logged in")

    SendEmail(Active_page);
    console.log("Email elküldve")

   
    await new Promise(resolve => setTimeout(resolve, 60000));
    console.log("closing")
    Browser.close();

}

async function SendEmail(page){
    await SafeGoto(page,Site.base)
    
   
    try{
        if(!page.url().startsWith(Site.base)) throw new Error("An error occoured. Not on the right page for sending email.")
            
            const New_email_button = '[data-unique-id="Ribbon-588"]> button[data-unique-id="Ribbon-588"]'; //the new email button's selector
            const address = '[id^="MSG_"][id$="_TO"]'
            const subject = '[id^="MSG_"][id$="_SUBJECT"]'
            const text = '#editorParent_1 > :first-child'
            const submit = '[id^="splitButton-r"][id$="__primaryActionButton"]'
        
            
            await page.waitForSelector(New_email_button,{ visible: true})
            await page.click(New_email_button) //occasionally clicks too early and program crashes. needs to remedy that.

            await page.waitForSelector(address,{visible: true})
            await page.focus(address)
            await page.keyboard.type(Email.address);

            await page.waitForSelector(subject,{visible: true})
            await page.focus(subject)
            await page.keyboard.type(Email.subject);

            await page.waitForSelector(text,{visible: true})
            await page.focus(text)
            await page.keyboard.type(Email.text);

            await page.waitForSelector(submit,{visible: true})
            await page.click(submit)

            



    }catch(err){

                console.log(err);
                process.exit(1);
    }

}


async function LogIn(page){
     console.log("Commencing login...")

    await SafeGoto(page, Site.login,'#i0116')
    

    await page.keyboard.type(EM);

     await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.keyboard.press('Enter')
    ]);
        
    await page.keyboard.type(PW);

    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.keyboard.press('Enter'),
        await page.waitForFunction(
            () => document.readyState === 'complete'
        )

    ]);
    
        const element = await page.$('#iShowSkip');  //skipping secondary email. can only skipped up to 7 days. todo: throw error if the 7 days are up. 
        if(element){ 
            await page.waitForSelector('#iShowSkip')
            await page.click('#iShowSkip');
        } 

        if(page.url().startsWith("https://login.live.com/ppsecure/")){ //stay logged in window

            await page.waitForSelector('#close-button');
            await page.click('#close-button')

        }
   


}


async function SafeGoto(page,url,selector = null){
    try{
                const response = await page.goto(url);
                if(!response||!response.ok()){
                    throw new Error(`Error loading page.\nResponse: ${response.status()}.\npage:${url}`);
                }else console.log("page successfully loaded.")

                if(selector){
                    await page.waitForSelector(selector)
                }

                return response;
            }catch(err){
                console.log(err);
                process.exit(1);

            }
}

