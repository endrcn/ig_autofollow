// Initialize button with user's preferred color
let btnStart = document.getElementById("btnStart");
let btnStop = document.getElementById("btnStop");
let username = document.getElementById("username");

btnStart.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let username = document.getElementById('username').value;
    chrome.storage.sync.set({ username });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: startFollow,
    });
});

// The body of this function will be executed as a content script inside the
// current page
async function startFollow() {
    let storage = await chrome.storage.sync.get();
    location.href = "https://instagram.com/" + storage.username;
}

async function getUserFollowers(followerLinkElem, followers = [], next) {
    let lastFollowerCount = followers.length;
    let count = 0;
    await this.driver.wait(until.elementLocated(By.css("ul.jSC57")));
    try {
        let followerContent = await this.driver.findElement(By.css("ul.jSC57"));
        // console.log("followerContent", followerContent);
        if (followerContent) {
            await this.driver.executeScript("arguments[0].scrollIntoView(false)", followerContent);
            await this.driver.sleep(2000);

            // await this.driver.wait(until.elementLocated(By.css("ul.jSC57 li")));
            let elemFollowerList = await followerContent.findElements(By.tagName("li"));

            elemFollowerList = elemFollowerList.splice(-50);

            console.log("elemFollowerList", elemFollowerList.length);

            for (let e of elemFollowerList) {
                try {
                    let followerName = (await e.getText() || "").split("\n")[0];
                    // console.log(followerName);
                    if (followerName != "" && !followers.includes(followerName)) {
                        followers.push(followerName);
                    }
                } catch (err) {
                    console.log("ERR2", e, err.message);
                }
            }

            console.log("followers", followers.length);

            if (followers.length > lastFollowerCount) {
                lastFollowerCount = followers.length;
                count = 0;
                console.log("lastFollowerCount", lastFollowerCount);
                return this.getUserFollowers(followerLinkElem, followers, next);
            } else if (count > 10) {
                console.log(info)
                // window.location.href = "https://www.instagram.com/"+followers[0]+"/";
                console.log("SON!", count, followers.length);
                return next(followers);
            }
            count++;
            console.log("COUNT", count);
            return this.getUserFollowers(followerLinkElem, followers, next);
            /* await this.driver.executeScript("arguments[0].scrollIntoView(false)", followerContent);
            await this.driver.sleep(2000); */
        } else {
            return next(followers);
        }
    } catch (err) {
        console.log("ERR", err.message);
    }

}