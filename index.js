import { Given, When, Then, After  } from '@cucumber/cucumber';
import puppeteer from 'puppeteer';

const EMAIL =     "MyPasswordIsTotallyNotMyUsernameBackwards@outlook.hu"; //this account got locked down by the end, it will not let you log in.
const PASSWORD =  "sdrawkcaBemanresUyMtoNyllatoTsIdrowssaPyM";

const showBrowser = process.env.SHOW_BROWSER === 'true';

 let browser,page;

const Site={
    base:"https://outlook.live.com/mail/0/",
    login:"https://go.microsoft.com/fwlink/p/?LinkID=2125442",
    get sent() {
        return this.base + 'sentitems';
    }
};

const Email={                           //if test email text is too long it MAY cause problems with ClearLastTestEmail
    address:"gugla9@gmail.com",
    subject:"Teszt tárgy",
    text:"Ez egy teszt üzenet."
}


//await TestAccount();

async function TestAccount(){
    const Browser = await puppeteer.launch({headless:false});
    const Active_page = await Browser.newPage();

    Active_page.on('dialog', async dialog => { //skips pop up window on leaving.
        if (dialog.type() === 'beforeunload') {
            await dialog.accept(); 
        } else {
            await dialog.dismiss();
        }
    });

    console.log("Browser started")

    await LogIn(Active_page,EMAIL,PASSWORD)
    console.log("logged in")

    await SendEmail(Active_page);
    console.log("Email sent")

    const isThere = await CheckEmail(Active_page);
    console.log(`Email is ${isThere?"":"not "}present in the sent emails folder`)

    // alternative to only delete the most recently made test email. and leave other emails.
    //if(isThere)console.log(`Email ${await ClearLastTestEmail(Active_page)?"is":"is not"} deleted.`);
    try{
    await ClearALLEmails(Active_page);
    }catch(err){console.log(err)}

    console.log("Email cleared")

    console.log("closing")
    page.close();
    Browser.close();

}
async function ClearLastTestEmail(page){
    await SafeGoto(page,Site.sent)

  try{
        if(!page.url().startsWith(Site.sent)) throw new Error("An error occoured. Not on the right page for checking sent emails.")
            
            const selector = `[aria-label*="${Email.address}"][aria-label*="${Email.subject}"][aria-label*="${Email.text}"] .wBMYh`; 
              
            

            try {
                await page.waitForSelector(selector, {
                visible: true,
                timeout: 10*1000
                });
                    await page.hover(selector)

                    await sleep(200)

                      await page.click(selector)

                return true;
                
            } catch(err) {
                console.log(err)
                return false;
            }
          
            

    }catch(err){
                await page.close();
 
                console.log(err);
                process.exit(1);
    }

}
async function ClearALLEmails(page){
await SafeGoto(page,Site.sent)

 
        if(!page.url().startsWith(Site.sent)) throw new Error("An error occoured. Not on the right page for checking sent emails.")
            
            const clear = `[data-unique-id="Ribbon-519"] > [data-unique-id="Ribbon-519"]` 
            
            await page.waitForSelector(clear,{ visible: true})
            await page.hover(clear)
            await sleep(600);
            await page.click(clear);
            await sleep(600);
            page.keyboard.press('Enter')  
             await sleep(600);

   
   

}
async function CheckEmail(page){
 await SafeGoto(page,Site.sent)


  try{
        if(!page.url().startsWith(Site.sent)) throw new Error("An error occoured. Not on the right page for checking sent emails.")
            
            const selector = `[aria-label*="${Email.address}"][aria-label*="${Email.subject}"][aria-label*="${Email.text}"]`; 
            
            try {
                await page.waitForSelector(selector, {
                visible: true,
                timeout: 3*1000
                });
                return true;
            } catch {
                return false;
            }

    }catch(err){
                await page.close();
                await browser.close();
                console.log(err);
                process.exit(1);
    }

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
            await sleep(100) //ocassionally needs more time.
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

            await sleep(800);
            



    }catch(err){
                await page.close();
                await browser.close();
                console.log(err);
                process.exit(1);
    }

}
async function LogIn(page,EM,PW){
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
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function SafeGoto(page,url,selector = null){

    for(let i=0;i<3;i++){
                try{
                    const response = await page.goto(url);
                    if(!response||!response.ok()){
                        throw new Error(`Error loading page.\nResponse: ${response.status()}.\npage:${url}`);
                    }

                    if(selector){
                        await page.waitForSelector(selector)
                    }

                    return response;
                }catch(err){
                    console.log("SafeGoto failed, retrying...");
                    

                }

        }
        await page.close();
        await browser.close();
        process.exit(1);
        
}
Given('I am logged in as {string} with password {string}',{ timeout: 30_000 }, async function (email, password) {
   browser = await puppeteer.launch({ headless: !showBrowser });
   page = await browser.newPage();

   page.on('dialog', async dialog => { //skips pop up window on leaving.
        if (dialog.type() === 'beforeunload') {
            await dialog.accept(); 
        } else {
            await dialog.dismiss();
        }
    });

  await LogIn(page, email, password);
 
});

When('I send an email to {string}',{ timeout: 30_000 }, async function (address) {
    Email.address = address;
await SendEmail(page)

});

Then('I clear the sent emails', { timeout: 30_000 }, async function () {
    for(let i=0;i<3;i++){
        try{
        await ClearALLEmails(page)

            if(await CheckEmail(page)) throw new Error("Emails were not deleted")

        break;
        }catch(err){
            console.log("retrying email clearing")
            if(i==2) console.log(err);
        }
    }
});

Then('the email should appear in my Sent folder',{ timeout: 60_000 }, async function () { //extra time since sometimes outlook needs more time to register the sent email.
    
    const isThere = await CheckEmail(page);
    if(!isThere) throw new Error("Email is not in the sent folder")
});

Then('I clear the email',{ timeout: 30_000 }, async function () {
    
    await ClearLastTestEmail(page)
});

/* after sometimes crashes?
After(async function () {
     if(!page.isClosed()) await page.close();
     if(browser) await browser.close();
});
*/