import Image from "next/image";
import LoginButton from "./components/loginButton";
import FAQButton from "./components/faqButton";
import TicketButton from "./components/ticketButton";
import NavButton from "./components/addButton";
import MobileNav from "./components/MobileNav";
import homepagePhoto1 from "./assets/homepagePhoto1.jpg";
import homepagePhoto2 from "./assets/homepagePhoto2.jpg";
import homepagePhoto3 from "./assets/homepagePhoto3.jpg";
import about1 from "./assets/about1.jpg";
import about2 from "./assets/about2.jpg";
import about3 from "./assets/about3.jpg";
import nico from "./assets/nico.png";
import nithik from "./assets/nithik.png";
import habig from "./assets/habig.png";
import holle from "./assets/holle.png";
import pucillo from "./assets/pucillo.png";
import p4 from "./assets/pusti.png";
import clayton from "./assets/clayton.jpg";
import roberts from "./assets/roberts.png";
import guenin from "./assets/guenin.jpg";
import vinson from "./assets/vinson.png";

import royalRumbleLogo from "./assets/logo.png";
import "./css/homepage.css";
import "./css/logo+login.css";
import "./css/mobile-nav.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { getRoyalRumbleTicketLink } from "../actions/other";
import { auth } from "@/auth";

export default async function Home() {
  const ticketLink = await getRoyalRumbleTicketLink();
  const session = await auth();

  const dashboardRoutes: Record<string, string> = {
    ADMIN: "/admin",
    AMBASSADOR: "/mentor/ambassador",
    "HALLWAY HOST": "/mentor/hallway_host",
    "UTILITY SQUAD": "/mentor/utility_squad",
    "CCA CONVOS": "/mentor/cca_convos",
    FRESHMAN: "/attendee/home",
  };

  const userJob = session?.user?.job;

  const dashboardLink =
    userJob && userJob in dashboardRoutes
      ? dashboardRoutes[userJob as keyof typeof dashboardRoutes]
      : "/";

  return (
    <main className="home-container">
      {session && (
        <div className="nav-buttons">
          <NavButton
            href="/"
            style={{
              width: "90px",
              height: "40px",
              padding: "5px 0px",
              fontSize: "15px",
            }}
          >
            Home
          </NavButton>

          <NavButton
            href={dashboardLink}
            style={{
              width: "140px",
              height: "40px",
              padding: "5px 0px",
              fontSize: "15px",
            }}
          >
            Dashboard
          </NavButton>
        </div>
      )}

      {session && <MobileNav homeHref="/" dashboardHref={dashboardLink} />}

      {/* <header style={{ backgroundColor: "red", color: "white" }}>
        THE IS A DEVOLPMENT SITE. FOR THE OFFICIAL ROYAL RUMBLE WEBSITE{" "}
        <a href="https://www.hseroyalrumble.com">CLICK HERE</a>
      </header> */}
      <LoginButton />

      <header className="home-header">
        <h1 className="home-title">Welcome to Royal Rumble</h1>
      </header>

      <section className="home-images-container">
        <div className="home-images">
          <Image
            src={homepagePhoto3}
            alt="Royal Rumble 3"
            className="home-image"
          />
          <Image
            src={homepagePhoto2}
            alt="Royal Rumble 2"
            className="home-image"
          />
          <Image
            src={homepagePhoto1}
            alt="Royal Rumble 1"
            className="home-image"
          />
        </div>

        <div className="home-logo-container">
          <Image
            src={royalRumbleLogo}
            alt="Royal Rumble Logo"
            className="home-logo"
          />
        </div>
      </section>

      {ticketLink && (
        <div className="home-ticket-button">
          <TicketButton link={ticketLink}>Buy your ticket now!</TicketButton>
        </div>
      )}

      <section className="home-bottom-buttons">
        <FAQButton link="/faq">Frequently Asked Questions</FAQButton>
      </section>

      <header className="home-header" style={{ marginTop: "5rem" }}>
        <h1 className="home-title">What is Royal Rumble?</h1>
      </header>

      <section className="rumble-section">
        <div className="rumble-grid">
          <div className="rumble-text">
            <p>
              Since 2015 the Royal Rumble gives incoming students a chance to
              learn the ins and outs of HSE by socializing with spirited
              upperclassman to whom they can turn to throughout the year;
              meeting new classmates from all walks of life; talking to members
              of student clubs; taking home their first official HSE class
              t-shirt; and shaking hands with school mascot Roary, the
              principal, and the rest of the faculty team!
            </p>
          </div>

          <div className="rumble-image">
            <Image src={about2} alt="Students cheering" />
          </div>

          {/* Row 2 */}
          <div
            className="rumble-image rumble-image-top"
            style={{ height: "575px" }}
          >
            <Image src={about1} alt="Student with crown" />
          </div>

          <div className="rumble-text">
            <p>
              Led by upperclassman mentors, incoming students get
              behind-the-scenes building tours complete with tips and tricks on
              navigating life as an HSE student. Want to know the best place to
              sit for lunch? Or where to go when you've lost your student ID?
              We've got you covered. Three activities include an introduction to
              school spirit with the pep band, Blue Crew, and cheerleaders;
              practice the school song and cheers; a welcome to HSE from the
              building principal and upperclassmen mentors; and an official
              start to student life at as a Royal!
            </p>
          </div>

          <div className="rumble-text">
            <p>
              There will also be resources for getting involved in clubs and
              activities, a chance to ask questions and get answers from
              upperclassmen and teachers, and a database of contacts within the
              building. The signature feature of the event is a pep rally,
              building excitement entering the new school year as Royals rally
              around each other under a common blue banner.
            </p>
          </div>

          <div className="rumble-image" style={{ height: "450px" }}>
            <Image src={about3} alt="Students sitting" />
          </div>
        </div>

        <div className="rumble-footer">
          <p>
            While the event takes place in person during the week before school
            starts, some elements of the Royal Rumble are virtual. Students can
            access this part of the program through their "Class of" Canvas
            page.
          </p>
        </div>
      </section>

      <header className="home-header" style={{ marginTop: "2rem" }}>
        <h1 className="home-title">Meet the Planning Committee</h1>
      </header>

      <section className="people-section">
        <div className="people-grid-three">
          <div className="person">
            <Image src={habig} alt="Person 1" />
            <h3>Ms. Kelsey Habig</h3>
            <p>khabig@hse.k12.in.us</p>
          </div>

          <div className="person">
            <Image src={pucillo} alt="Person 2" />
            <h3>Mrs. Annie Pucillo</h3>
            <p>apucillo@hse.k12.in.us</p>
          </div>

          <div className="person">
            <Image src={holle} alt="Person 3" />
            <h3>Mrs. Jen Holle</h3>
            <p>jholle@hse.k12.in.us</p>
          </div>

          <div className="person">
            <Image src={p4} alt="Person 4" />
            <h3>Ms. Emily Pusti</h3>
            <p>epusti@hse.k12.in.us</p>
          </div>

          <div className="person">
            <Image src={roberts} alt="Person 5" />
            <h3>Ms. Kassie Roberts</h3>
            <p>kroberts@hse.k12.in.us</p>
          </div>

          <div className="person">
            <Image src={royalRumbleLogo} alt="Person 6" />
            <h3>Mrs. Morgan Porter</h3>
            <p>mporter@hse.k12.in.us</p>
          </div>

          <div className="person">
            <Image src={guenin} alt="Person 7" />
            <h3>Mr. Steve Guenin</h3>
            <p>sguenin@hse.k12.in.us</p>
          </div>

          <div className="person">
            <Image src={clayton} alt="Person 8" />
            <h3>Mrs. Katie Clayton</h3>
            <p>kclayton@hse.k12.in.us</p>
          </div>

          <div className="person">
            <Image src={vinson} alt="Person 9" />
            <h3>Ms. Paige Vinson</h3>
            <p>pgvinson@hse.k12.in.us</p>
          </div>
        </div>

        <header className="home-header" style={{ marginTop: "5rem" }}>
          <h1 className="home-title">Meet the Website Creators</h1>
        </header>

        <div className="people-grid-two">
          <div className="person">
            <Image src={nico} alt="Person 1" />
            <h3>Nico Suriano</h3>
            <p>Lead Designer</p>
          </div>

          <div className="person">
            <Image src={nithik} alt="Person 2" />
            <h3>Nithik Sajja</h3>
            <p>Lead Developer</p>
          </div>
        </div>
      </section>

      {/* Contact form removed — replaced with direct email contact */}
      {/* <section className="contact-form">
        <header className="home-header">
          <h1 className="home-title">Contact</h1>
        </header>

        <p className="contact-subtitle">
          Feel free to fill out the form below if you have any questions,
          concerns, or feedback!
        </p>

        <div className="contact-row">
          <label>Name</label>
          <input type="text" placeholder="First Name" />
          <input type="text" placeholder="Last Name" />
        </div>

        <div className="contact-row" style={{ marginBottom: "2rem" }}>
          <label>Email</label>
          <input type="email" placeholder="name@example.com" />
        </div>

        <label>Comment</label>
        <textarea placeholder="Your comment here..." />

        <SubmitButton
          href=""
          style={{ fontSize: "30px", alignSelf: "center", marginTop: "1rem" }}
        >
          Submit
        </SubmitButton>
      </section> */}

      <section className="contact-form">
        <header className="home-header">
          <h1 className="home-title">Contact</h1>
        </header>

        <p className="contact-subtitle">
          Have any questions, concerns, or feedback? Email Ms. Kelsey Habig at{" "}
          <a href="mailto:khabig@hse.k12.in.us">khabig@hse.k12.in.us</a>.
        </p>
      </section>
    </main>
  );
}
