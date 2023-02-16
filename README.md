<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]




<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/link858/woweconomybot">
  </a>

<h1 align="center">Warcraftlogs Economy Bot</h1>

  <p align="center">
    An Economy Bot based on parse average!
    <br />
    <a href="https://github.com/link858/woweconomybot/issues"><strong>Report Bug »</strong></a>
    <br />
    <br />
    <a href="https://github.com/link858/woweconomybot/issues"><strong>Request Feature »</strong></a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://github.com/link858/woweconomybot)

**A basic economy bot that pulls the average dps percentiles from each player in a report and adds that to their balance**

Create a shop with items for players to buy with their parse points

It isnt really finished and there is some commented code and commands that dont work correctly but it can still be used for its general purpose
## USER COMMANDS
**$shop**
* Displays the items from the shop in an embed message

**$register**
* Players register their INGAME character name ***$register Sirpews***

**$balance**
* Players use this to check their balance

**$buy**
* Players use ***$buy item amount*** to purchase items from the shop

**$redeem**
* Players use this command to redeem and remove the item from their inventory for delivery and sends a message to the log channel

**$inventory**
* Players use this to check their inventory

**$give**
* Players use this to give items to others from their inventory ***$give sirpews apples 1***

**$quest**
* Simple command that gives a random reward once a day

**$help**
* Displays some of the commands players can use

**$ask**
* Use OpenAI to ask a question


## ADMIN COMMANDS

**$shoplist**
* Staff use this command in a channel to display the shop and info about it

**$editshop add**
* Staff use this command to ADD item_name price and description to the shop ***$editshop add apples 5 Shiny Red apples***

 **$editshop edit**
* Staff use this command to EDIT a item_name price and description in the shop ***$editshop edit apples 1 Rotten Apples***

**$editshop remove**
* Staff use this command to REMOVE items from the shop ***$editshop remove apples***

**$add**
* Staff use this command to ADD to players balance. ***$add Sirpews 10***

**$subtract**
* Staff use this command to SUBTRACT from players balance. ***$add Sirpews 10***

**$updatepoints**
* The main command to update players balance based on their dps average from the report, it will display the players names and what they earned in an embed
* use ***$updatepoints pHmNFgYkfharD49z***


<p align="right">(<a href="#readme-top">back to top</a>)</p>
<!-- GETTING STARTED -->




### Prerequisites
**NODEJS**

First and foremost you obviously need NodeJS.

* [Nodejs.org](https://nodejs.org/)

* Get a discord API key
 
* Get a warcraftlogs API
  
  

### Installation

1. Download the zip from github

2. Extract the files into a folder


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

**INSTALLING THE REQUIRED MODULES**

Open the command prompt in the scripts folder and use
* npm ci
 ```sh
  npm ci
 ```


**Starting the script**

Open the command prompt in the scripts folder and use
* node bot.js
  ```sh
  node bot.js
  ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [ ] Create more $quests
- [ ] Create a working lottery system
- [ ] Create a selectmenu after buying to display item types to buy 
- [ ] More.

See the [open issues](https://github.com/link858/woweconomybot/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

As always please if you have anything to contribute or suggest feel free.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTACT -->
## Contact
**DISCORD**
Wreckin#2365 - wreckinisterrible@gmail.com

Project Link: [https://github.com/link858/woweconomybot](https://github.com/link858/woweconomybot)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments
* Boult


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/link858/woweconomybot.svg?style=for-the-badge
[contributors-url]: https://github.com/link858/woweconomybot/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/link858/woweconomybot.svg?style=for-the-badge
[forks-url]: https://github.com/link858/woweconomybot/network/members
[stars-shield]: https://img.shields.io/github/stars/link858/woweconomybot.svg?style=for-the-badge
[stars-url]: https://github.com/link858/woweconomybot/stargazers
[issues-shield]: https://img.shields.io/github/issues/link858/woweconomybot.svg?style=for-the-badge
[issues-url]: https://github.com/link858/woweconomybot/issues
[product-screenshot]: https://cdn.discordapp.com/attachments/973743247061049397/1075784949245947984/screenshot.png
[Nodejs.org]: https://img.shields.io/badge/-Nodejs-61DAFB?logo=react&logoColor=white&logoWidth=30
[Nodejs-url]: https://nodejs.org
