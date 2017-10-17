# Focus: A SOFTENG 702 Project

## Brief
> In this project, a browser extension is built that can monitor and manage the user's personal online time and use of websites. Concepts of this kind, with various levels of strictness exist. Focus in this project is on addressing personal interest to limit or keep track of one's own online usage, so in this project no sharing of data, no hard locks. It should be investigated in the literature: how can the problem be addressed with such a system, what do we know about the evidence of success, what features do people want. A related aspect that can be more or less emphasized is: how can positive use be made of such activities as work break reminders and mental relaxation or stimulus.

## Project Goal
To create an application where the user can easily visualise their internet usage. By allowing them to track their top applications, we are providing them with the ability to be self-aware and self-reflect. The proposed project will have an effective UI to visualise their usage. This will give them real-time feedback over allocated monthly periods. This goal is combined with work-break reminders. Our application ensures the user still has complete control over their own productivity and how they spend their time, but motivates them by providing them with a full work breakdown.

The overall goal for our project is to deploy motivational strategies to allow users to stick to long term pre-determined targets, rather than short term distractions. This is done by providing a users with a useful visualisation of their time spent online, to allow them to better understand their usage.

## Research Question
How can a user effectively limit and/or keep track of their internet usage over a certain amount of time?

## Group 4B Members
| Name              | Github Username |
| ----------------- | --------------- |
| Ida De Smet       | @idaknow        |
| Christina Bell    | @ChristinaBell  |
| Jinye (Jacky) Mai | @JackyMai       |
| Sha (Ciel) Luo    | @Is-morning     |

#### Implementation Contributions

Jacky: Initial project setup and ambient noise. <br />
Ciel: Work cycle timer. <br />
Ida & Christina: Internet usage (work cycle, weekly, monthly & daily pie chart) & documentation.<br />

## Instructions
1. Download this repository `git clone https://github.com/JackyMai/focus.git` <br />
2. Visit [this URL ](chrome://extensions) in your Google Chrome browser
3. Select **Extensions** under the **More Tools** menu
4. Enable **Developer mode**
5. Click **Load unpacked extension** and navigate to the appropriate Focus directory
6. Click **Update extensions now** and **Reload** under the extensions tab

## How to use

![](https://github.com/JackyMai/focus/blob/master/Focus-how-to-use.PNG)

### View Internet Usage

Use the dropdown menu in the bottom left, under the list of websites, to choose the timeframe shown. <br />
Hover over the pie char to view number of visits. <br />

### Work Cycle

Set your work cycle time in the bottom left hand corner by either typing or increasing/ decreasing the time-frame.
Press **Start** in the bottom right corner to begin the work cycle. This will then change to a **Stop** button.
You will be notified with a pop-up when the work cycle is over. You can then view your internet usage for this cycle.

### Ambient Noise
This can be selected using the drop-down menu in the bottom right. Here the user can select one or multiple sounds.
