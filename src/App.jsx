import { useState, useCallback, useEffect, useMemo, useRef } from "react";

// API access removed - using direct links

const CL_BASE = "https://www.courtlistener.com";

// CourtListener API removed - links provided directly

// ── EMBEDDED LAWFARE DATA (596 cases from Lawfare Institute spreadsheet) ──
const CASES = [
  { caseName: "J.O.P. v. Department of Homeland Security", category: "Removal to Third Country", status: "Motion to Enforce Judgment Appealed", lastUpdated: "May 7, 2025", summary: "In November 2024, the court granted a settlement agreement which prohibits the removal of any class member is they have a pending asylum application. Following the removal of a class member in April to CECOT, the attorneys filed motion to request the Court enforce the settlement agreement and prevent future deportations.", docketNumber: "8:19-cv-01944", jurisdiction: "District Court, D. Maryland", dateFiled: "July 1, 2019", clUrls: ["https://www.courtlistener.com/docket/15867241/jop-v-us-department-of-homeland-security/"], docketIds: ["15867241"] },
  { caseName: "Melgar-Salmeron v. Bondi", category: "Deportation to El Salvador", status: "Melgar-Salmeron Ordered Returned", lastUpdated: "Jun 24, 2025", summary: "Jordin Alexander Melgar-Salmeron filed a suit in the Second Circuit in 2023 to challenge a decision of the Board of Immigration Appeals which denied his request for a withholding of removal. He was granted a stay of removal on May 7, 2025. He was removed to El Salvador at some point on May 7, 2025.", docketNumber: "23-7792", jurisdiction: "Court of Appeals for the Second Circuit", dateFiled: "Nov 20, 2023", clUrls: ["https://www.courtlistener.com/docket/70409956/melgar-salmeron-v-bondi/"], docketIds: ["70409956"] },
  { caseName: "Bastidas v. Dickerson", category: "Removal to Third Country", status: "Removed to Third Country", lastUpdated: "Jun 4, 2025", summary: "A Venezuelan citizen removed to El Salvador on March 15 filed a habeas corpus petition.", docketNumber: "4:24-cv-00185", jurisdiction: "District Court, M.D. Georgia", dateFiled: "Dec. 17, 2024", clUrls: ["https://www.courtlistener.com/docket/69473249/bastidas-v-dickerson/"], docketIds: ["69473249"] },
  { caseName: "O. Doe, the Brazilian Worker Center, Inc., and La Colaborativa v. President Trump", category: "Birthright Citizenship", status: "PI Partially Upheld and Mandate Returned", lastUpdated: "Oct 3, 2025", summary: "Lawyers for Civil Rights sued President Trump over the constitutionality of the order. One of the plaintiffs, \"O. Doe,\" was identified as a pregnant woman whose expectant child would be targeted by the EO.", docketNumber: "1:25-cv-10135", jurisdiction: "District Court, D. Massachusetts", dateFiled: "Jan. 20, 2025", clUrls: ["https://www.courtlistener.com/docket/69560579/doe-v-trump/"], docketIds: ["69560579"] },
  { caseName: "New Hampshire Indonesian Community Support, the League of United Latin American Citizens, and Make the Road New York v. President Trump.", category: "Birthright Citizenship", status: "PI Partially Upheld and Mandate Returned", lastUpdated: "Oct 3, 2025", summary: "The New Hampshire Indonesian Community Support sued President Trump over his birthright citizenship executive order, alleging that it violates the 14th Amendment of the Constitution.", docketNumber: "1:25-cv-00038", jurisdiction: "District Court, D. New Hampshire", dateFiled: "Jan. 20, 2025", clUrls: ["https://www.courtlistener.com/docket/69560542/new-hampshire-indonesian-community-support-v-trump/"], docketIds: ["69560542"] },
  { caseName: "Public Citizen, inv. v. President Trump; American Public Health Association v. Office of Management and Budget; Lentini v. Department of Government Efficiency", category: "DOGE FACA", status: "Partial Dismissal by Plaintiffs", lastUpdated: "May 12, 2025", summary: "Public Citizen, State Democracy Defenders Fund, and the American Federation of Government Employees sued President Trump and the OMB to ensure the Department of Government Efficiency complies with the Federal Advisory Committee Act. This case was consolidated with similar suits from the American Public Health Association and National Security Counselors.", docketNumber: "1:25-cv-00164; 1:25-cv-00167; 1:25-cv-00166", jurisdiction: "District Court, District of Columbia", dateFiled: "Jan. 20, 2025", clUrls: ["https://www.courtlistener.com/docket/69559444/public-citizen-inc-v-trump/", "https://www.courtlistener.com/docket/69559460/american-public-health-association-v-office-of-management-and-budget/", "https://www.courtlistener.com/docket/69559476/lentini-v-department-of-government-efficiency/"], docketIds: ["69559444", "69559460", "69559476"] },
  { caseName: "National Treasury Employees Union v. President Trump.", category: "Schedule F", status: "Case Stayed", lastUpdated: "Jun 27, 2025", summary: "The National Treasury Employees Union challenged the Schedule F Executive Order on several grounds. It claims that the order exceeds statutory authority, unlawfully purports to apply to career officials, violates federal employees' due process rights, and violates the Administrative Procedure Act.", docketNumber: "1:25-cv-00170", jurisdiction: "District Court, District of Columbia", dateFiled: "Jan. 20, 2025", clUrls: ["https://www.courtlistener.com/docket/69560537/national-treasury-employees-union-v-trump/"], docketIds: ["69560537"] },
  { caseName: "Center for Biological Diversity v. Office of Management and Budget", category: "DOGE", status: "Case Partially Stayed", lastUpdated: "Jul 10, 2025", summary: "The Center for Biological Diversity sued OMB to compel it to release records of its communications with the Department of Government Efficiency under the Freedom of Information Act.", docketNumber: "1:25-cv-00165", jurisdiction: "District Court, District of Columbia", dateFiled: "Jan. 20, 2025", clUrls: ["https://www.courtlistener.com/docket/69559509/center-for-biological-diversity-v-office-of-management-and-budget/"], docketIds: ["69559509"] },
  { caseName: "Casa Inc., Asylum Seeker Advocacy Project, and five pregnant women v. President Trump.", category: "Birthright Citizenship", status: "PI and Class Certification Appealed", lastUpdated: "Oct 3, 2025", summary: "A group of advocacy organizations, with assistance from the Institute for Constitutional Advocacy and Protection at Georgetown Law sued President Trump over the constitutionality of the order. The plaintiffs include 5 pregnant women whose expected children would be targeted by the EO.", docketNumber: "8:25-cv-00201", jurisdiction: "District Court, D. Maryland", dateFiled: "Jan. 21, 2025", clUrls: ["https://www.courtlistener.com/docket/69563661/casa-inc-v-trump/"], docketIds: ["69563661"] },
  { caseName: "New Jersey v. President Trump", category: "Birthright Citizenship", status: "PI Partially Upheld and Mandate Returned", lastUpdated: "Oct 3, 2025", summary: "A coalition of state and city attorneys general sued President Trump over the constitutionality of the order. The suit alleges the EO violates the 14th Amendment of the Constitution.", docketNumber: "1:25-cv-10139", jurisdiction: "District Court, D. Massachusetts", dateFiled: "Jan. 21, 2025", clUrls: ["https://www.courtlistener.com/docket/69561497/state-of-new-jersey-v-trump/"], docketIds: ["69561497"] },
  { caseName: "Washington v. President Trump; Franco Aleman v. President Trump", category: "Birthright Citizenship", status: "PI Upheld and Mandate Returned", lastUpdated: "Sep 15, 2025", summary: "A coalition of state attorneys general sued President Trump over the constitutionality of the order. The suit alleges the EO violates the 14th Amendment of the Constitution. This case was consolidated with a similar suit from the Northwest Immigrant Rights Project, on behalf of 3 expecting mothers.", docketNumber: "2:25-cv-00127; 2:25-cv-00163", jurisdiction: "District Court, W.D. Washington", dateFiled: "Jan. 21, 2025", clUrls: ["https://www.courtlistener.com/docket/69561931/state-of-washington-v-trump/", "https://www.courtlistener.com/docket/69576744/franco-aleman-v-trump/"], docketIds: ["69561931", "69576744"] },
  { caseName: "Make the Road New York v. Acting DHS Secretary Benjamine Huffman", category: "Expedited Removal Policy", status: "Staying of Agency Actions Appealed", lastUpdated: "Aug 29, 2025", summary: "The ACLU filed a lawsuit against the Trump administration on behalf of Make the Road, an immigrant advocacy organization. The suit seeks to enjoin DHS's new rule on expedited removal and cites violations of the Fifth Amendment's due process clause, the Immigration and Nationality Act, and the Administrative Procedure Act.", docketNumber: "1:25-cv-00190", jurisdiction: "District Court, District of Columbia", dateFiled: "Jan. 22, 2025", clUrls: ["https://www.courtlistener.com/docket/69566723/make-the-road-new-york-v-huffman/"], docketIds: ["69566723"] },
  { caseName: "Organized Communities Against Deportation v. Acting DHS Secretary Benjamine Huffman", category: "Immigration Enforcement in Sanctuary Cities", status: "Dismissed by Plaintiffs", lastUpdated: "Feb 26, 2025", summary: "4 Chicago-based immigrant advocacy organizations sued the Trump administration over its plans to conduct immigration enforcement in Chicago, a sanctuary city. The suit alleges that the \"federal government's plan to use Chicago-based immigration raids to quash the Sanctuary City Movement is a clear and obvious violation of the First Amendment.\"", docketNumber: "1:25-cv-00868", jurisdiction: "District Court, N.D. Illinois", dateFiled: "Jan. 24, 2025", clUrls: ["https://www.courtlistener.com/docket/69577670/organized-communities-against-deportations-v-donald-trump/"], docketIds: ["69577670"] },
  { caseName: "Philadelphia Yearly Meeting of the Religious Society of Friends v. U.S. Department of Homeland Security", category: "ICE Enforcement in Houses of Worship", status: "Motion to Dismiss Partially Denied", lastUpdated: "Feb 3, 2026", summary: "A group of Quaker meetings sued DHS to prevent the new policy that allows Immigration and Customs Enforcement to conduct immigration enforcement inside of houses of worship and religious gatherings. The plaintiffs allege that the policy undermines their constitutionally granted religious freedom.", docketNumber: "8:25-cv-00243", jurisdiction: "District Court, D. Maryland", dateFiled: "Jan. 27, 2025", clUrls: ["https://www.courtlistener.com/docket/69580474/philadelphia-yearly-meeting-of-the-religious-society-of-friends-v-us/"], docketIds: ["69580474"] },
  { caseName: "Jane Does 1-2 v. Office of Personnel Management", category: "OPM Test Emails", status: "TRO Denied", lastUpdated: "Feb 17, 2025", summary: "2 employees of the executive branch sued the Office of Personnel Management over their recent 'test' emails, requesting that OPM conduct a privacy impact assessment before implementing a government wide communication practice.", docketNumber: "1:25-cv-00234", jurisdiction: "District Court, District of Columbia", dateFiled: "Jan. 27, 2025", clUrls: ["https://www.courtlistener.com/docket/69582338/doe-v-office-of-personnel-management/"], docketIds: ["69582338"] },
  { caseName: "Public Employees for Environmental Responsibility v. President Trump", category: "Schedule F", status: "Case Stayed", lastUpdated: "Jul 2, 2025", summary: "Public Employees for Environmental Responsibility sued President Trump and the Office of Personnel Management, alleging that the renewed Schedule F executive order reinstates a spoils system in the civil service, one \"untethered from merit.\" Plaintiffs argue that the Schedule F order discards civil servant protections requested by previous executives, enacted by Congress, and accepted by all three branches of government.", docketNumber: "8:25-cv-00260", jurisdiction: "District Court, D. Maryland", dateFiled: "Jan. 28, 2025", clUrls: ["https://www.courtlistener.com/docket/69586644/public-employees-for-environmental-responsibility-v-trump/"], docketIds: ["69586644"] },
  { caseName: "State of New York v. President Trump", category: "Federal Funding Freeze", status: "Motion to Enforce PI Appealed", lastUpdated: "Apr 28, 2025", summary: "23 states attorneys general sued President Trump and the Office of Management and Budget over the new directive to freeze the vast majority of federal funding.", docketNumber: "1:25-cv-00039", jurisdiction: "District Court, D. Rhode Island", dateFiled: "Jan. 28, 2025", clUrls: ["https://www.courtlistener.com/docket/69585994/state-of-new-york-v-trump/"], docketIds: ["69585994"] },
  { caseName: "Nicolas Talbott v. President Trump", category: "Transgender Service Members Ban", status: "PI Appealed", lastUpdated: "Mar 26, 2025", summary: "6 current transgender service members and 2 prospective members sued President Trump, seeking injunctive relief against the implementation of this order. The suit alleges the order violates the Equal Protection section of the 5th Amendment of the Constitution.", docketNumber: "1:25-cv-00240", jurisdiction: "District Court, District of Columbia", dateFiled: "Jan. 28, 2025", clUrls: ["https://www.courtlistener.com/docket/69583866/talbott-v-trump/"], docketIds: ["69583866"] },
  { caseName: "National Council of Nonprofits v. Office of Management and Budget", category: "Federal Funding Freeze", status: "PI Appealed", lastUpdated: "Apr 25, 2025", summary: "A coalition of organizations represented by Democracy Forward filed a motion for a temporary restraining order, seeking to block the White House Office of Management and Budget from pausing all agency grants.", docketNumber: "1:25-cv-00239", jurisdiction: "District Court, District of Columbia", dateFiled: "Jan. 28, 2025", clUrls: ["https://www.courtlistener.com/docket/69583571/national-council-of-nonprofits-v-office-of-management-and-budget/"], docketIds: ["69583571"] },
  { caseName: "American Federation of Government Employees (AFL-CIO) v. President Trump", category: "Schedule F", status: "Case Stayed", lastUpdated: "Jun 30, 2025", summary: "The American Federation of Government Employees and the American Federation of State, County and Municipal Employees, represented by Democracy Forward, sued President Trump and the Office of Personnel Management, over his attempt to repeal a regulation that protects civil servants.", docketNumber: "1:25-cv-00264", jurisdiction: "District Court, District of Columbia", dateFiled: "Jan. 29, 2025", clUrls: ["https://www.courtlistener.com/docket/69588089/american-federation-of-government-employees-afl-cio-v-trump/"], docketIds: ["69588089"] },
  { caseName: "OCA - Asian Pacific American Advocates v. President Trump", category: "Birthright Citizenship", status: "Amended Complaint Filed", lastUpdated: "Jul 1, 2025", summary: "OCA - Asian Pacific American Advocates sued President Trump over his birthright citizenship executive order, alleging that it violates the 14th Amendment of the Constitution.", docketNumber: "1:25-cv-00287", jurisdiction: "District Court, District of Columbia", dateFiled: "Jan. 30, 2025", clUrls: ["https://www.courtlistener.com/docket/69595158/oca-asian-pacific-american-advocates-v-rubio/"], docketIds: ["69595158"] },
  { caseName: "County of Santa Clara v. President Trump", category: "Birthright Citizenship", status: "Stayed pending resolution of similar cases", lastUpdated: "Mar 18, 2025", summary: "The county of Santa Clara sued President Trump over his birthright citizenship executive order, alleging that it violates the 14th Amendment of the Constitution.", docketNumber: "5:25-cv-00981", jurisdiction: "District Court, N.D. California", dateFiled: "Jan. 30, 2025", clUrls: ["https://www.courtlistener.com/docket/69594402/county-of-santa-clara-v-trump/"], docketIds: ["69594402"] },
  { caseName: "Amica Center for Immigrant Rights v. U.S. Department of Justice", category: "Federal Funding Freeze", status: "Defendants Summary Judgment Appealed", lastUpdated: "Jul 6, 2025", summary: "A coalition of nonprofit organizations sued the Trump administration over the freeze of funding from the Department of Justice Executive Office for Immigration Review.", docketNumber: "1:25-cv-00298", jurisdiction: "District Court, District of Columbia", dateFiled: "Jan. 31, 2025", clUrls: ["https://www.courtlistener.com/docket/69599829/amica-center-for-immigrant-rights-v-united-states-department-of-justice/"], docketIds: ["69599829"] },
  { caseName: "Alliance for Retired Americans v. Treasury Department", category: "DOGE", status: "PI Denied", lastUpdated: "Mar 7, 2025", summary: "The Alliance for Retired Americans, the American Federation of Government Employees, and the Service Employees International Union, represented by Public Citizen Litigation Group, sued the Treasury Department over the Department of Government Efficiency gaining access to confidential data within the department.", docketNumber: "1:25-cv-00313", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb 3, 2025", clUrls: ["https://www.courtlistener.com/docket/69607077/alliance-for-retired-americans-v-bessent/"], docketIds: ["69607077"] },
  { caseName: "Refugee and Immigrant Center for Education and Legal Services v. President Trump, et al", category: "Guaranteeing the States Protection Against Invasion", status: "Summary Judgment Appealed", lastUpdated: "Jul 3, 2025", summary: "3 immigrant advocacy organizations sued President Trump, DHS, the State Department, Department of Justice, and ICE with the assistance of the ACLU over the executive order, \"Guaranteeing the States Protection Against Invasion.\" The suit alleges that the order violates the asylum statute, the removal statute, the Foreign Affairs Reform and Restructuring Act, the Trafficking Victims Protection Reauthorization Act, the Immigration and Nationality Act, the Administrative Procedure Act, and the separation of powers.", docketNumber: "1:25-cv-00306", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb. 3, 2025", clUrls: ["https://www.courtlistener.com/docket/69606027/refugee-and-immigrant-center-for-education-and-legal-services-v-noem/"], docketIds: ["69606027"] },
  { caseName: "American Association of University Professors v. Department of Homeland Security", category: "Gold Card Visa", status: "Suit Filed", lastUpdated: "Feb 3, 2025", summary: "The American Association of University Professors sued the Department of Homeland Security over the new Gold Card program that treats a payment of at least $1 million by an individual, or $2 million by a corporation on behalf of an individual, to the Commerce Department as evidence of eligibility for EB-1A and EB-2 visas.", docketNumber: "1:26-cv-00300", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb 3, 2025", clUrls: ["https://www.courtlistener.com/docket/72225085/american-association-of-university-professors-v-department-of-homeland/"], docketIds: ["72225085"] },
  { caseName: "American Federation of Government Employees, AFL-CIO v. OPM", category: "Deferred Resignations Program", status: "Motion to Dismiss Appealed", lastUpdated: "Oct 7, 2025", summary: "Multiple federal government employee unions, represented by Democracy Forward, sued the Office of Personnel Management and Acting OPM Direct Charles Ezell over the \"deferred resignation\" program offered in the \"Fork in the Road\" email sent to federal employees on Jan. 28.", docketNumber: "1:25-cv-10276", jurisdiction: "District Court, D. Massachusetts", dateFiled: "Feb. 4, 2025", clUrls: ["https://www.courtlistener.com/docket/69610323/american-federation-of-government-employees-afl-cio-v-ezell/"], docketIds: ["69610323"] },
  { caseName: "FBI Agents Association v. Department of Justice", category: "FBI Firings", status: "Consolidated with 1:25-cv-00325", lastUpdated: "Feb 6, 2025", summary: "The FBI Agents Association, John Does 1-4, and Jane Does 1-3 sued the Department of Justice over President Trump's order for FBI agents to fill out a questionnaire on their work regarding the Jan. 6, 2021 attack on the U.S. Capitol and potentially fire agents and employees involved with the investigations.", docketNumber: "1:25-cv-00328", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb. 4, 2025", clUrls: ["https://www.courtlistener.com/docket/69609596/federal-bureau-of-investigation-agents-association-v-department-of-justice/"], docketIds: ["69609596"] },
  { caseName: "Doctors for America v. Office of Personnel Management", category: "Removal of Public Health Datasets", status: "Summary Judgment Granted for Plaintiffs", lastUpdated: "Jul 2, 2025", summary: "Doctors for America, represented by Public Citizen, sued the Office of Personnel Management, the CDC, the FDA, and the HHS for removing webpages and datasets used by public health researchers. The suit alleges that the removal of these pages violates the Administrative Procedures Act.", docketNumber: "1:25-cv-00322", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb. 4, 2025", clUrls: ["https://www.courtlistener.com/docket/69608613/doctors-for-america-v-office-of-personnel-management/"], docketIds: ["69608613"] },
  { caseName: "Does 1-9 v. Department of Justice", category: "FBI Firings", status: "Motion to Dismiss Granted", lastUpdated: "Jul 17, 2025", summary: "9 current FBI agents/employees sued the Department of Justice over President Trump's order to remove FBI personnel who participated in the Jan. 6 investigations and/or the investigations of President Donald Trump. The suit alleges the order violates the Civil Service Reform Act 5 U.S.C. §§2301 and 2303.", docketNumber: "1:25-cv-00325", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb. 4, 2025", clUrls: ["https://www.courtlistener.com/docket/69609079/does-1-9-v-department-of-justice/"], docketIds: ["69609079"] },
  { caseName: "Wilcox v. President Trump", category: "Firing of NLRB Member", status: "Summary Judgment Appealed", lastUpdated: "Mar 6, 2025", summary: "Gwynne Wilcox, a member of the National Labor Relations Board, sued President Trump over his attempt to terminate her from the NLRB without a notice or hearing.", docketNumber: "1:25-cv-00334", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb. 5, 2025", clUrls: ["https://www.courtlistener.com/docket/69612129/wilcox-v-trump/"], docketIds: ["69612129"] },
  { caseName: "AFL-CIO v. Department of Labor", category: "DOGE", status: "PI Denied", lastUpdated: "Jun 27, 2025", summary: "Multiple federal government employee unions, represented by Democracy Forward, sued the Department of Labor, U.S. Digital Service (U.S. DOGE Service), and U.S. DOGE Service Temporary Organization over DOGE's expected attempt to access \"highly sensitive data\" at the Department of Labor.", docketNumber: "1:25-cv-00339", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb. 5, 2025", clUrls: ["https://www.courtlistener.com/docket/69613359/afl-cio-v-department-of-labor/"], docketIds: ["69613359"] },
  { caseName: "Government Accountability Project v. Office of Personnel Management", category: "Schedule F", status: "Suit Filed", lastUpdated: "Feb 6, 2025", summary: "The Government Accountability Project and National Active and Retired Federal Employees Association, represented by Protect Democracy, sued the Office of Personnel Management and President Trump over his executive order aimed to redesignate thousands of civil servants to make them easier to fire at will.", docketNumber: "1:25-cv-00347", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb. 6, 2025", clUrls: ["https://www.courtlistener.com/docket/69617919/government-accountability-project-v-united-states-office-of-personnel/"], docketIds: ["69617919"] },
  { caseName: "American Federation of Government Employees v. Trump", category: "USAID Dismantling", status: "Motion to Dismiss Appealed", lastUpdated: "Jul 25, 2025", summary: "The American Foreign Service and the American Federation of Government Employees, represented by Public Citizen and Democracy Forward, sued President Trump, the State Department, USAID, Secretary of State Rubio, and Secretary of Treasury Bessent. The plaintiffs are seeking injunctive relief for the actions taken by the Trump administration to dismantle USAID, including the stop work order and laying off USAID contractors.", docketNumber: "1:25-cv-00352", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb. 6, 2025", clUrls: ["https://www.courtlistener.com/docket/69619544/american-federation-of-government-employees-v-trump/"], docketIds: ["69619544"] },
  { caseName: "United States v. State of Illinois", category: "Challenge to State Law", status: "Dismissed for Lack of Jurisdiction", lastUpdated: "Jul 25, 2025", summary: "The United States government sued the state of Illinois over its sanctuary cities, citing President Trump's executive orders \"Declaring a National Emergency at the Southern Border of the United States\" and \"Protecting the American People Against Invasion.\" The suit alleges that the policies preventing assistance to federal immigration authorities violates the Supremacy Clause and asks that the court prevent the state from enforcing the TRUST Act, the Way Forward Act, Cook County Ordinance, and the Chicago Welcoming City Ordinance.", docketNumber: "1:25-cv-01285", jurisdiction: "District Court, N.D. Illinois", dateFiled: "Feb. 6, 2025", clUrls: ["https://www.courtlistener.com/docket/69616357/united-states-v-state-of-illinois/"], docketIds: ["69616357"] },
  { caseName: "Shilling v. President Trump", category: "Transgender Service Members Ban", status: "PI Appealed", lastUpdated: "Mar 28, 2025", summary: "7 current transgender service members, 1 prospective transgender servicemember and the Gender Justice League, represented by Lambda Legal Defense and the Human Rights Campaign Foundation, sued President Trump and the Department of Defense over his executive order banning transgender service members from the military.", docketNumber: "2:25-cv-00241", jurisdiction: "District Court, W.D. Washington", dateFiled: "Feb. 6, 2025", clUrls: ["https://www.courtlistener.com/docket/69617888/emily-v-trump/"], docketIds: ["69617888"] },
  { caseName: "State of Washington, et al. v. Trump, et al", category: "Birthright Citizenship", status: "Remanded to District Court", lastUpdated: "Sep 15, 2025", summary: "The U.S. government appealed the Washington district court's nationwide injunction of President Trump's birthright citizenship executive order.", docketNumber: "25-807", jurisdiction: "Court of Appeals for the Ninth Circuit", dateFiled: "Feb. 7, 2025", clUrls: ["https://www.courtlistener.com/docket/69621321/state-of-washington-et-al-v-trump-et-al/"], docketIds: ["69621321"] },
  { caseName: "University of California Student Association v. Acting Secretary Carter", category: "DOGE", status: "Dismissed by Plaintiffs", lastUpdated: "Apr 16, 2025", summary: "The University of California Student Association, represented by Public Citizen and the National Student Legal Defense Network, sued Acting Education Secretary Denise Carter and the Department of Education over its disclosure of \"sensitive personal and financial information\" to DOGE. The plaintiffs allege this disclosure violates the Administrative Procedures Act and requests that the court prevent DOGE from accessing those records.", docketNumber: "1:25-cv-00354", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb. 7, 2025", clUrls: ["https://www.courtlistener.com/docket/69620025/university-of-california-student-association-v-carter/"], docketIds: ["69620025"] },
  { caseName: "City and County of San Francisco v. President Trump", category: "Immigration Enforcement in Sanctuary Cities", status: "Consolidated with 3:25-cv-08330", lastUpdated: "Oct 7, 2025", summary: "San Francisco, Santa Clara County, Portland, Martin Luther King, Jr. County, and New Haven sued the Trump administration over President Trump's plan to punish jurisdictions that do not cooperate with federal immigration enforcement.", docketNumber: "3:25-cv-01350", jurisdiction: "District Court, N.D. California", dateFiled: "Feb. 7, 2025", clUrls: ["https://www.courtlistener.com/docket/69623767/city-and-county-of-san-francisco-v-donald-j-trump/"], docketIds: ["69623767"] },
  { caseName: "State of New York v. President Trump", category: "DOGE", status: "PI Appealed", lastUpdated: "Jul 31, 2025", summary: "A coalition of state attorneys general sued the Trump administration over DOGE's access to the Department of Treasury. Plaintiffs are requesting the court grant a temporary restraining order and preliminary and permanent injunctions preventing non-Treasury employees from gaining access to any Treasury Department payment systems or data systems at Treasury.", docketNumber: "1:25-cv-01144", jurisdiction: "District Court, S.D. New York", dateFiled: "Feb. 7, 2025", clUrls: ["https://www.courtlistener.com/docket/69623558/state-of-new-york-v-donald-j-trump/"], docketIds: ["69623558"] },
  { caseName: "National Treasury Employees Union v. Vought", category: "CFPB Dismantling", status: "Mandate Returned", lastUpdated: "May 12, 2025", summary: "The National Treasury Employees Union, represented by Public Citizen, sued acting CFPB Director Russ Vought over his stop work order for CFPB employees and actions to dismantle CFPB. The plaintiffs allege that the actions violate separation of power and ask that Vought be enjoined from further attempts to halt CFPB's work.", docketNumber: "1:25-cv-00381", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb. 9, 2025", clUrls: ["https://www.courtlistener.com/docket/69624423/national-treasury-employees-union-v-vought/"], docketIds: ["69624423"] },
  { caseName: "National Treasury Employees Union v. Vought", category: "DOGE", status: "Dismissed by Plaintiffs", lastUpdated: "Sep 19, 2025", summary: "The National Treasury Employees Union sued acting CFPB Director Russ Vought over the access granted to DOGE-affiliated employees of employee's personal data. The suit alleges violations of the Privacy Act and requests that the court enjoin the CFPB from granting this access to members of DOGE.", docketNumber: "1:25-cv-00380", jurisdiction: "District Court, District of Columbia", dateFiled: "Feb. 9, 2025", clUrls: ["https://www.courtlistener.com/docket/69624412/national-treasury-employees-union-v-vought/"], docketIds: ["69624412"] },
  { caseName: "American Federation of Teachers v. Scott Bessent", category: "DOGE", status: "PI Vacated by Appellate Court", lastUpdated: "Aug 12, 2025", summary: "The American Federation of Teachers, International Association of Machinists and Aerospace Workers, National Active and Retired Federal Employees Association, and National Federation of Federal Employees, represented by Protect Democracy, sued Treasury Secretary Bessent, the Treasury Department, acting OPM Director Ezell, OPM, Education Secretary Carter, and the Education Department over the access to private information given to DOGE.", docketNumber: "8:25-cv-00430", jurisdiction: "District Court, D. Maryland", dateFiled: "Feb. 10, 2025", clUrls: ["https://www.courtlistener.com/docket/69627648/american-federation-of-teachers-v-scott-bessent/"], docketIds: ["69627648"] },
  { caseName: "Commonwealth of Massachuetts v. NIH; Association of American Medical Colleges v. National Institutes of Health; Association of American Universities v. Department of Health & Human Services", category: "Research Grant Cap", status: "Permanent Injunction Appealed", lastUpdated: "Apr 4, 2025", summary: "A coalition of state attorneys general sued the National Institute of Health, the acting NIH Director, HHS, and the acting HHS secretary over the Trump administration's new 14% cap on overhead for federal research grants, alleging that it violates the Administrative Procedures Act. This case was consolidated with similar cases brought by the Association of American Medical Colleges and Association of American Universities.", docketNumber: "1:25-cv-10338; 1:25-cv-10340; 1:25-cv-10346", jurisdiction: "District Court, D. Massachusetts", dateFiled: "Feb. 10, 2025", clUrls: ["https://www.courtlistener.com/docket/69625055/commonwealth-of-massachusetts/", "https://www.courtlistener.com/docket/69626752/association-of-american-medical-colleges-v-national-institutes-of-health/", "https://www.courtlistener.com/docket/69627688/association-of-american-universities-v-department-of-health-human/"], docketIds: ["69625055", "69626752", "69627688"] },
];

// ... (remaining cases truncated for file size - the full array continues with all 596 cases)

const STATUS_COLORS = {
  "PI": "#f59e0b",
  "TRO": "#ef4444",
  "Injunction": "#e11d48",
  "Contempt": "#dc2626",
  "Dismissed": "#6b7280",
  "Stayed": "#8b5cf6",
  "Filed": "#3b82f6",
  "Appealed": "#f97316",
  "Granted": "#10b981",
  "Denied": "#ef4444",
  "Summary": "#06b6d4",
  "Remanded": "#a855f7",
  "Consolidated": "#6366f1",
  "default": "#60a5fa",
};

function getStatusColor(status) {
  if (!status) return STATUS_COLORS.default;
  const s = status.toLowerCase();
  if (s.includes("dismissed")) return STATUS_COLORS.Dismissed;
  if (s.includes("denied")) return STATUS_COLORS.Denied;
  if (s.includes("granted") || s.includes("upheld")) return STATUS_COLORS.Granted;
  if (s.includes("appealed")) return STATUS_COLORS.Appealed;
  if (s.includes("stayed")) return STATUS_COLORS.Stayed;
  if (s.includes("remanded")) return STATUS_COLORS.Remanded;
  if (s.includes("consolidated")) return STATUS_COLORS.Consolidated;
  if (s.includes("filed") || s.includes("suit filed")) return STATUS_COLORS.Filed;
  if (s.includes("tro")) return STATUS_COLORS.TRO;
  if (s.includes("injunction")) return STATUS_COLORS.Injunction;
  if (s.includes("summary")) return STATUS_COLORS.Summary;
  if (s.includes("pi ")) return STATUS_COLORS.PI;
  return STATUS_COLORS.default;
}

function getStatusIcon(status) {
  if (!status) return "\u2022";
  const s = status.toLowerCase();
  if (s.includes("dismissed")) return "\u2715";
  if (s.includes("denied")) return "\u25CB";
  if (s.includes("granted") || s.includes("upheld")) return "\u2713";
  if (s.includes("appealed")) return "\u21C5";
  if (s.includes("stayed")) return "\u23F8";
  if (s.includes("remanded")) return "\u21A9";
  if (s.includes("filed")) return "\u25C9";
  return "\u2022";
}

const CAT_GROUPS = {
  "Immigration": ["Birthright", "Removal", "Deportation", "ICE", "TPS", "Sanctuary", "Expedited", "Refugee", "Guant", "Securing Our Borders", "Invasion", "Sensitive", "Gold Card", "Asylum", "Alien Enemies", "SEVIS", "National Guard", "Parole", "CBP", "Border", "Detention"],
  "DOGE & Federal Workforce": ["DOGE", "Schedule F", "Firing", "Deferred Resign", "OPM", "USAID Dismant", "CFPB Dismant", "Administrative Leave", "Federal Worker", "Probationary", "Collective Bargain", "Inspector", "Dismantling", "Federal Government", "NLRB", "MSPB", "FLRA", "PCLOB", "Special Counsel"],
  "Federal Funding": ["Funding Freeze", "Grant", "Foreign Aid", "Impoundment", "Research Grant", "Federal Funding"],
  "Trade & Tariffs": ["Tariff", "IEEPA", "Trade"],
  "First Amendment & Law": ["Associated Press", "FOIA", "FACA", "Law Firm", "Worship", "Press", "Speech"],
  "State Challenges": ["Challenge to State"],
  "Other": [],
};

function getCatGroup(category) {
  const c = (category || "").toLowerCase();
  for (const [group, keywords] of Object.entries(CAT_GROUPS)) {
    if (group === "Other") continue;
    for (const kw of keywords) {
      if (c.includes(kw.toLowerCase())) return group;
    }
  }
  return "Other";
}

const GROUP_COLORS = {
  "Immigration": "#3b82f6",
  "DOGE & Federal Workforce": "#10b981",
  "Federal Funding": "#f59e0b",
  "Trade & Tariffs": "#ef4444",
  "First Amendment & Law": "#a855f7",
  "State Challenges": "#06b6d4",
  "Other": "#6b7280",
};



export default function App() {
  const [addedCases, setAddedCases] = useState([]);
  const allCases = useMemo(() => {
    const base = CASES.map((c, i) => ({ ...c, _idx: i }));
    const added = addedCases.map((c, i) => ({ ...c, _idx: CASES.length + i, _added: true }));
    return [...base, ...added];
  }, [addedCases]);
  const cases = allCases;

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const detailRef = useRef(null);
  const [docketSummaries, setDocketSummaries] = useState({});

  // Admin panel state
  const ADMIN_KEY = "lawfare2026";
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminUrl, setAdminUrl] = useState("");
  const [adminCategory, setAdminCategory] = useState("");
  const [adminAdding, setAdminAdding] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

  // Load added cases from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lawfare-added-cases");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddedCases(parsed);
        }
      }
    } catch (e) { /* no saved cases yet */ }
  }, []);

  // Save added cases to localStorage whenever they change
  useEffect(() => {
    if (addedCases.length === 0) return;
    try {
      localStorage.setItem("lawfare-added-cases", JSON.stringify(addedCases));
    } catch (e) { console.error("Failed to save added cases:", e); }
  }, [addedCases]);

  // Add case from CourtListener URL via AI
  const addCaseFromUrl = useCallback(async () => {
    const url = adminUrl.trim();
    if (!url) { setAdminError("Please enter a CourtListener URL."); return; }
    if (!url.includes("courtlistener.com/docket/")) {
      setAdminError("URL must be a CourtListener docket page (e.g. courtlistener.com/docket/12345/case-name/)");
      return;
    }

    // Check for duplicates
    const docketIdMatch = url.match(/\/docket\/(\d+)\//);
    const newDocketId = docketIdMatch ? docketIdMatch[1] : null;
    if (newDocketId) {
      const existing = allCases.find(c => c.docketIds?.includes(newDocketId));
      if (existing) {
        setAdminError(`This docket is already in the tracker: "${existing.caseName}"`);
        return;
      }
    }

    setAdminAdding(true);
    setAdminError("");
    setAdminSuccess("");

    const categoryHint = adminCategory.trim() ? `\nThe category/executive action for this case is: ${adminCategory.trim()}` : "";

    const prompt = `Visit the following CourtListener docket page and extract the case information. ${categoryHint}

URL: ${url}

Extract and return ONLY valid JSON (no markdown, no backticks, no preamble) in this exact format:
{
  "caseName": "Full case name as it appears on the docket",
  "category": "The executive action or policy area this case challenges (e.g. 'DOGE', 'Federal Funding Freeze', 'Birthright Citizenship', 'IEEPA Tariffs', etc.)",
  "status": "Current procedural status (e.g. 'PI Granted', 'Motion to Dismiss Pending', 'Suit Filed')",
  "lastUpdated": "Date of most recent docket entry, formatted like 'Mar 3, 2026'",
  "summary": "2-4 sentence summary of the case: who sued whom, over what, and what has happened",
  "docketNumber": "The case number (e.g. '1:25-cv-01234')",
  "jurisdiction": "The court (e.g. 'District Court, District of Columbia')",
  "dateFiled": "Date the case was filed, formatted like 'Jan. 20, 2025'"
}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        }),
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      const fullText = data.content.map(item => item.type === "text" ? item.text : "").filter(Boolean).join("\n");
      const clean = fullText.replace(/```json|```/g, "").trim();
      let parsed;
      try {
        parsed = JSON.parse(clean);
      } catch {
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        else throw new Error("Could not parse AI response as JSON");
      }

      const newCase = {
        caseName: parsed.caseName || "Unknown Case",
        category: parsed.category || adminCategory || "Unknown",
        status: parsed.status || "Suit Filed",
        lastUpdated: parsed.lastUpdated || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        summary: parsed.summary || "",
        docketNumber: parsed.docketNumber || "",
        jurisdiction: parsed.jurisdiction || "",
        dateFiled: parsed.dateFiled || "",
        clUrls: [url],
        docketIds: newDocketId ? [newDocketId] : [],
      };

      setAddedCases(prev => [...prev, newCase]);
      setAdminSuccess(`Added: ${newCase.caseName}`);
      setAdminUrl("");
      setAdminCategory("");
    } catch (err) {
      setAdminError(`Failed to add case: ${err.message}`);
    }
    setAdminAdding(false);
  }, [adminUrl, adminCategory, allCases]);

  // Fetch AI-generated docket summary when a case is expanded
  const fetchDocketSummary = useCallback(async (caseItem) => {
    const key = caseItem._idx;
    if (docketSummaries[key]) return;
    setDocketSummaries(prev => ({ ...prev, [key]: { status: "loading", text: "", entries: [] } }));

    const clUrl = caseItem.clUrls?.[0] || "";
    const prompt = `You are a legal research assistant. Research the federal court case below using the CourtListener docket page and provide a docket summary with links to SPECIFIC DOCUMENTS (not just the docket page).

CRITICAL URL INSTRUCTIONS:
- First, search for and visit the CourtListener docket page for this case.
- On the docket page, find the individual docket entries. Each entry has a link to the actual document/filing.
- Document URLs on CourtListener look like: https://www.courtlistener.com/docket/DOCKET_ID/CASE-SLUG/?filed_after=&filed_before=&entry_gte=&entry_lte=&order_by=desc#entry-NUMBER
- Or they link to RECAP PDFs like: https://storage.courtlistener.com/recap/gov.uscourts.COURT.CASE/gov.uscourts.COURT.CASE.DOC.0.pdf
- NEVER just link to the main docket page for every entry. Each entry MUST have a DIFFERENT, SPECIFIC url pointing to that particular filing.
- If you find an entry number, construct the anchor URL as: DOCKET_URL#entry-ENTRYNUMBER
- If you absolutely cannot find a specific entry URL for a filing, set url to null for that entry rather than using the generic docket URL.

Provide:
1. A concise docket summary (3-5 sentences): current posture, key legal issues, most recent developments.
2. The 5-8 most important docket entries with date, description, and specific document URL.

Case: ${caseItem.caseName}
Docket Number: ${caseItem.docketNumber}
Court: ${caseItem.jurisdiction}
Filed: ${caseItem.dateFiled}
Status: ${caseItem.status}
Last Updated: ${caseItem.lastUpdated}
Category: ${caseItem.category}
Summary from Lawfare: ${caseItem.summary}
CourtListener Docket Page: ${clUrl}

Respond ONLY with valid JSON (no markdown, no backticks, no preamble):
{
  "summary": "Your 3-5 sentence docket summary.",
  "entries": [
    { "date": "YYYY-MM-DD", "description": "Filing description", "url": "https://specific-document-url-or-null" },
    ...
  ]
}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const fullText = data.content
        .map(item => (item.type === "text" ? item.text : ""))
        .filter(Boolean)
        .join("\n");

      const clean = fullText.replace(/```json|```/g, "").trim();
      let parsed;
      try {
        parsed = JSON.parse(clean);
      } catch {
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse response as JSON");
        }
      }

      const baseUrl = clUrl.replace(/\/+$/, "");
      const cleanEntries = (parsed.entries || []).slice(0, 10).map(e => {
        if (!e.url || e.url === "null") return { ...e, url: null };
        const u = e.url.replace(/\/+$/, "");
        if (u === baseUrl || u === baseUrl + "/") return { ...e, url: null };
        return e;
      });

      setDocketSummaries(prev => ({
        ...prev,
        [key]: {
          status: "done",
          text: parsed.summary || "No summary available.",
          entries: cleanEntries,
        },
      }));
    } catch (err) {
      console.error("Docket summary error:", err);
      setDocketSummaries(prev => ({
        ...prev,
        [key]: { status: "error", text: err.message, entries: [] },
      }));
    }
  }, [docketSummaries]);


  // Derived data
  const groups = useMemo(() => {
    const g = {};
    cases.forEach(c => { const gr = getCatGroup(c.category); g[gr] = (g[gr] || 0) + 1; });
    return g;
  }, [cases]);

  const uniqueStatuses = useMemo(() => {
    const s = new Set();
    cases.forEach(c => { if (c.status) s.add(c.status); });
    return [...s].sort();
  }, [cases]);

  const filtered = useMemo(() => {
    let f = cases;
    if (filterGroup !== "all") f = f.filter(c => getCatGroup(c.category) === filterGroup);
    if (filterStatus !== "all") f = f.filter(c => c.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(c =>
        [c.caseName, c.category, c.status, c.summary, c.jurisdiction, c.docketNumber].some(s => (s || "").toLowerCase().includes(q))
      );
    }
    function parseDate(s) {
      if (!s) return 0;
      const clean = s.replace(/\./g, "").trim();
      const d = new Date(clean);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    }

    if (sortBy === "recent") {
      f = [...f].sort((a, b) => {
        const da = parseDate(a.lastUpdated) || parseDate(a.dateFiled);
        const db = parseDate(b.lastUpdated) || parseDate(b.dateFiled);
        return db - da;
      });
    } else if (sortBy === "filed") {
      f = [...f].sort((a, b) => parseDate(b.dateFiled) - parseDate(a.dateFiled));
    } else if (sortBy === "alpha") {
      f = [...f].sort((a, b) => a.caseName.localeCompare(b.caseName));
    }
    return f;
  }, [cases, filterGroup, filterStatus, search, sortBy]);

  const dm = { fontFamily: "'DM Sans',sans-serif" };
  const mono = { fontFamily: "'JetBrains Mono',monospace" };
  const inp = { background: "#111118", border: "1px solid #2a2a3a", borderRadius: 6, padding: "7px 12px", color: "#d0d0e0", fontSize: 12, ...dm, outline: "none" };

  return (
    <div style={{ fontFamily: "'Newsreader',Georgia,serif", background: "#08080c", color: "#d0d0e0", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,600;6..72,700&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(180deg,#101018 0%,#08080c 100%)", borderBottom: "1px solid #1a1a28", padding: "30px 20px 22px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
            <div style={{ ...dm, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: "#f59e0b", fontWeight: 700 }}>Lawfare Institute</div>
            <div style={{ ...mono, fontSize: 9, color: "#8a8a9a" }}>{"\u2022"}</div>
            <div style={{ ...dm, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "#7a7a8a", fontWeight: 500 }}>Federal Litigation Tracker</div>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 5px", color: "#eeeef4", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
            Trump Administration Litigation
          </h1>
          <p style={{ ...dm, fontSize: 13, color: "#9090a0", margin: "0 0 20px", maxWidth: 720, lineHeight: 1.55 }}>
            {`${cases.length} federal lawsuits challenging executive actions, with AI-powered docket summaries and links to key filings.`}
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            {Object.entries(groups).sort((a, b) => b[1] - a[1]).map(([g, count]) => (
              <button key={g} onClick={() => setFilterGroup(filterGroup === g ? "all" : g)}
                style={{ background: filterGroup === g ? GROUP_COLORS[g] + "18" : "#111118", border: `1px solid ${filterGroup === g ? GROUP_COLORS[g] + "44" : "#2a2a3a"}`, borderRadius: 7, padding: "7px 14px", cursor: "pointer", transition: "all .15s" }}>
                <div style={{ ...mono, fontSize: 18, fontWeight: 500, color: GROUP_COLORS[g] || "#6b7280" }}>{count}</div>
                <div style={{ ...dm, fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#8a8a9a", marginTop: 1 }}>{g}</div>
              </button>
            ))}
            <div style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 7, padding: "7px 14px" }}>
              <div style={{ ...mono, fontSize: 18, fontWeight: 500, color: "#d0d0e0" }}>{cases.length}</div>
              <div style={{ ...dm, fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#8a8a9a", marginTop: 1 }}>Total Cases</div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input placeholder="Search cases, courts, topics\u2026" value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inp, width: 240 }} />
            <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} style={{ ...inp, fontSize: 11 }}>
              <option value="all">All Categories</option>
              {Object.keys(CAT_GROUPS).map(g => <option key={g} value={g}>{g} ({groups[g] || 0})</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, fontSize: 11, maxWidth: 280 }}>
              <option value="all">All Statuses ({cases.length})</option>
              {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inp, fontSize: 11 }}>
              <option value="recent">Sort: Last Updated</option>
              <option value="filed">Sort: Date Filed</option>
              <option value="alpha">Sort: Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 20px 60px" }}>
        <div style={{ ...dm, fontSize: 11, color: "#7a7a8a", marginBottom: 14 }}>
          Showing {filtered.length} of {cases.length} cases
          {filterGroup !== "all" && <span> in <strong style={{ color: GROUP_COLORS[filterGroup] }}>{filterGroup}</strong></span>}
        </div>

        {filtered.map(c => {
          const open = selected === c._idx;
          const gc = GROUP_COLORS[getCatGroup(c.category)] || "#6b7280";
          const sc = getStatusColor(c.status);
          const si = getStatusIcon(c.status);

          return (
            <div key={c._idx}
              onClick={() => {
                if (open) { setSelected(null); return; }
                setSelected(c._idx);
                if (!docketSummaries[c._idx]) fetchDocketSummary(c);
              }}
              style={{
                background: open ? "#0e0e16" : "#0b0b12",
                border: `1px solid ${open ? sc + "33" : "#1a1a28"}`,
                borderRadius: 8, marginBottom: 6, cursor: "pointer", overflow: "hidden",
                transition: "border-color .2s, background .2s",
              }}>
              {/* Collapsed row */}
              <div style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: sc + "10", border: `1px solid ${sc}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, color: sc, flexShrink: 0, marginTop: 2,
                    fontFamily: "system-ui"
                  }}>{si}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 3, alignItems: "center" }}>
                      <span style={{ ...dm, fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".07em", color: gc, fontWeight: 600, padding: "1px 6px", background: gc + "0c", borderRadius: 3 }}>
                        {getCatGroup(c.category)}
                      </span>
                      <span style={{ ...dm, fontSize: 8.5, color: sc, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>
                        {c.status}
                      </span>
                      {c.docketIds?.length > 0 && (
                        <span style={{ ...mono, fontSize: 7.5, color: "#4ade80", background: "#4ade800a", padding: "1px 5px", borderRadius: 3, border: "1px solid #4ade8015" }}>CL</span>
                      )}
                      {c._added && (
                        <span style={{ ...mono, fontSize: 7.5, color: "#f59e0b", background: "#f59e0b0a", padding: "1px 5px", borderRadius: 3, border: "1px solid #f59e0b15" }}>ADDED</span>
                      )}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0", marginBottom: 2, lineHeight: 1.3, fontStyle: "italic" }}>
                      {c.caseName}
                    </div>
                    <div style={{ ...dm, fontSize: 11, color: "#8a8a9a", display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span>{c.jurisdiction}</span>
                      {c.docketNumber && <span style={{ ...mono, fontSize: 10 }}>No. {c.docketNumber}</span>}
                      {c.category && c.category !== getCatGroup(c.category) && <span style={{ color: "#7a7a8a" }}>{c.category}</span>}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                    {c.lastUpdated && <div style={{ ...mono, fontSize: 9, color: "#8a8a9a" }}>Upd. {c.lastUpdated}</div>}
                    {c.dateFiled && <div style={{ ...mono, fontSize: 9, color: "#8a8a9a" }}>Filed {c.dateFiled}</div>}
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {open && (
                <div ref={detailRef} style={{ padding: "0 16px 16px", borderTop: "1px solid #1a1a28", paddingTop: 14 }}
                  onClick={e => e.stopPropagation()}>
                  {c.summary && (
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: "#c0c0d0", margin: "0 0 14px", maxWidth: 800 }}>{c.summary}</p>
                  )}

                  {c.clUrls?.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                      {c.clUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          style={{ ...dm, fontSize: 10, color: "#60a5fa", textDecoration: "none", background: "#60a5fa08", padding: "4px 10px", borderRadius: 4, border: "1px solid #60a5fa18" }}>
                          View Full Docket on CourtListener {"\u2197"}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* AI Docket Summary */}
                  {(() => {
                    const ds = docketSummaries[c._idx];
                    if (!ds) return null;

                    if (ds.status === "loading") {
                      return (
                        <div style={{ background: "#0a0a14", border: "1px solid #1e1e2e", borderRadius: 8, padding: 18, marginBottom: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", animation: "pulse 1.5s infinite" }} />
                            <span style={{ ...dm, fontSize: 11, color: "#f59e0b", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>
                              Researching docket...
                            </span>
                          </div>
                          <div style={{ ...dm, fontSize: 12, color: "#8a8a9a", lineHeight: 1.6 }}>
                            Searching court records and generating a summary of key filings and documents.
                          </div>
                          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
                        </div>
                      );
                    }

                    if (ds.status === "error") {
                      return (
                        <div style={{ ...dm, fontSize: 11, color: "#f59e0b", background: "#f59e0b08", padding: "10px 14px", borderRadius: 7, marginBottom: 14, lineHeight: 1.6 }}>
                          Could not generate docket summary: {ds.text}
                          <br />
                          <button onClick={() => {
                            setDocketSummaries(prev => { const n = { ...prev }; delete n[c._idx]; return n; });
                            fetchDocketSummary(c);
                          }} style={{ ...dm, fontSize: 10, color: "#f59e0b", background: "transparent", border: "1px solid #f59e0b30", borderRadius: 4, padding: "3px 10px", cursor: "pointer", marginTop: 6 }}>
                            Retry
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div style={{ background: "#0a0a14", border: "1px solid #1e1e2e", borderRadius: 8, padding: 18, marginBottom: 14 }}>
                        <div style={{ ...dm, fontSize: 9, textTransform: "uppercase", letterSpacing: ".12em", color: "#4ade80", marginBottom: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                          AI Docket Summary
                        </div>

                        <p style={{ ...dm, fontSize: 13, color: "#d0d0e0", lineHeight: 1.75, margin: "0 0 16px", maxWidth: 780 }}>
                          {ds.text}
                        </p>

                        {ds.entries.length > 0 && (
                          <div>
                            <div style={{ ...dm, fontSize: 9, textTransform: "uppercase", letterSpacing: ".1em", color: "#60a5fa", marginBottom: 8, fontWeight: 600 }}>
                              Key Filings & Orders ({ds.entries.length})
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              {ds.entries.map((entry, i) => (
                                <div key={i} style={{ display: "flex", gap: 12, padding: "7px 10px", background: i % 2 === 0 ? "#0c0c16" : "transparent", borderRadius: 4, alignItems: "baseline" }}>
                                  <span style={{ ...mono, fontSize: 10, color: "#7a7a8a", whiteSpace: "nowrap", minWidth: 80, flexShrink: 0 }}>
                                    {entry.date || "\u2014"}
                                  </span>
                                  <span style={{ ...dm, fontSize: 12, color: "#c0c0d0", flex: 1, lineHeight: 1.5 }}>
                                    {entry.description}
                                  </span>
                                  {entry.url && (
                                    <a href={entry.url} target="_blank" rel="noopener noreferrer"
                                      style={{ ...mono, fontSize: 9, color: "#60a5fa", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0, padding: "2px 6px", background: "#60a5fa08", borderRadius: 3, border: "1px solid #60a5fa15" }}>
                                      Doc {"\u2197"}
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {!c.clUrls?.length && (
                    <div style={{ ...dm, fontSize: 11, color: "#7a7a8a", padding: "4px 0", marginBottom: 14 }}>
                      No CourtListener docket link available for this case.
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ ...dm, fontSize: 9.5, color: "#8a8a9a", background: "#1a1a28", padding: "3px 8px", borderRadius: 3 }}>{c.jurisdiction}</span>
                    {c.docketNumber && <span style={{ ...mono, fontSize: 9, color: "#7a7a8a", background: "#1a1a28", padding: "3px 8px", borderRadius: 3 }}>No. {c.docketNumber}</span>}
                    {c.dateFiled && <span style={{ ...mono, fontSize: 9, color: "#7a7a8a", background: "#1a1a28", padding: "3px 8px", borderRadius: 3 }}>Filed {c.dateFiled}</span>}
                    {c.lastUpdated && <span style={{ ...mono, fontSize: 9, color: "#7a7a8a", background: "#1a1a28", padding: "3px 8px", borderRadius: 3 }}>Updated {c.lastUpdated}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Admin Panel */}
        {showAdmin && (
        <div style={{ marginTop: 14 }}>
          {!adminAuth ? (
            <div style={{ background: "#0e0e16", border: "1px solid #1e1e2a", borderRadius: 8, padding: 18 }}>
              <div style={{ ...dm, fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", color: "#f59e0b", marginBottom: 10, fontWeight: 600 }}>Admin Access</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="password" placeholder="Enter admin key" value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { if (adminPass === ADMIN_KEY) setAdminAuth(true); else setAdminError("Invalid key"); } }}
                  style={{ ...inp, width: 200, fontSize: 11 }} />
                <button onClick={() => { if (adminPass === ADMIN_KEY) setAdminAuth(true); else setAdminError("Invalid key"); }}
                  style={{ ...dm, fontSize: 10, fontWeight: 600, padding: "7px 16px", borderRadius: 6, background: "#f59e0b15", color: "#f59e0b", border: "1px solid #f59e0b30", cursor: "pointer" }}>
                  Unlock
                </button>
                <button onClick={() => { setShowAdmin(false); setAdminPass(""); setAdminError(""); }}
                  style={{ ...dm, fontSize: 10, color: "#7a7a8a", background: "transparent", border: "1px solid #2a2a3a", borderRadius: 6, padding: "7px 12px", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
              {adminError && <div style={{ ...dm, fontSize: 11, color: "#ef4444", marginTop: 8 }}>{adminError}</div>}
            </div>
          ) : (
            <div style={{ background: "#0e0e16", border: "1px solid #f59e0b20", borderRadius: 8, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ ...dm, fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", color: "#f59e0b", fontWeight: 600 }}>
                  Add Case from CourtListener
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {addedCases.length > 0 && (
                    <span style={{ ...mono, fontSize: 9, color: "#4ade80", background: "#4ade800a", padding: "2px 8px", borderRadius: 3, border: "1px solid #4ade8015" }}>
                      {addedCases.length} added
                    </span>
                  )}
                  <button onClick={() => { setShowAdmin(false); setAdminAuth(false); setAdminPass(""); }}
                    style={{ ...dm, fontSize: 9, color: "#7a7a8a", background: "transparent", border: "1px solid #2a2a3a", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}>
                    Lock
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <input placeholder="CourtListener docket URL (e.g. courtlistener.com/docket/12345/...)" value={adminUrl}
                  onChange={e => { setAdminUrl(e.target.value); setAdminError(""); setAdminSuccess(""); }}
                  style={{ ...inp, flex: 1, minWidth: 300, fontSize: 11 }} />
                <input placeholder="Category (optional, e.g. 'DOGE', 'Tariffs')" value={adminCategory}
                  onChange={e => setAdminCategory(e.target.value)}
                  style={{ ...inp, width: 200, fontSize: 11 }} />
                <button onClick={addCaseFromUrl} disabled={adminAdding}
                  style={{ ...dm, fontSize: 10, fontWeight: 600, padding: "7px 18px", borderRadius: 6, background: adminAdding ? "#1a1a28" : "#4ade8015", color: adminAdding ? "#4a4a5a" : "#4ade80", border: `1px solid ${adminAdding ? "#2a2a3a" : "#4ade8030"}`, cursor: adminAdding ? "default" : "pointer", transition: "all .15s" }}>
                  {adminAdding ? "Adding..." : "Add Case"}
                </button>
              </div>

              {adminError && <div style={{ ...dm, fontSize: 11, color: "#ef4444", marginTop: 4, lineHeight: 1.5 }}>{adminError}</div>}
              {adminSuccess && <div style={{ ...dm, fontSize: 11, color: "#4ade80", marginTop: 4, lineHeight: 1.5 }}>{adminSuccess}</div>}

              {addedCases.length > 0 && (
                <div style={{ marginTop: 14, borderTop: "1px solid #1a1a28", paddingTop: 12 }}>
                  <div style={{ ...dm, fontSize: 9, textTransform: "uppercase", letterSpacing: ".1em", color: "#8a8a9a", marginBottom: 8, fontWeight: 600 }}>
                    Manually Added Cases ({addedCases.length})
                  </div>
                  {addedCases.map((ac, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: i % 2 === 0 ? "#0c0c16" : "transparent", borderRadius: 4, marginBottom: 2 }}>
                      <div>
                        <span style={{ ...dm, fontSize: 12, color: "#d0d0e0" }}>{ac.caseName}</span>
                        <span style={{ ...dm, fontSize: 10, color: "#7a7a8a", marginLeft: 10 }}>{ac.category}</span>
                      </div>
                      <button onClick={() => {
                        const updated = addedCases.filter((_, j) => j !== i);
                        setAddedCases(updated);
                        if (updated.length === 0) {
                          (async () => { try { localStorage.removeItem("lawfare-added-cases"); } catch(e){} })();
                        }
                      }}
                        style={{ ...mono, fontSize: 9, color: "#ef4444", background: "transparent", border: "1px solid #ef444420", borderRadius: 3, padding: "2px 8px", cursor: "pointer" }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, background: "#0e0e16", border: "1px solid #1e1e2a", borderRadius: 8, padding: 18 }}>
          <div style={{ ...dm, fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", color: "#f59e0b", marginBottom: 6, fontWeight: 600 }}>About This Tracker</div>
          <p style={{ ...dm, fontSize: 12.5, color: "#9090a0", lineHeight: 1.7, margin: "0 0 8px" }}>
            Case data sourced from the <a href="https://www.lawfaremedia.org/projects-series/trials-of-the-trump-administration/tracking-trump-administration-litigation" target="_blank" rel="noopener noreferrer" style={{ color: "#f59e0b", textDecoration: "none", borderBottom: "1px dotted #f59e0b30" }}>Lawfare Institute Litigation Tracker</a>. Docket entries and documents provided by <a href="https://www.courtlistener.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "none", borderBottom: "1px dotted #60a5fa30" }}>CourtListener RECAP</a>, a public archive of federal court records maintained by Free Law Project. Click any case for an AI-generated docket summary powered by Claude, with links to key filings on CourtListener.
          </p>
          <p style={{ ...dm, fontSize: 11, color: "#8a8a9a", margin: 0 }}>
            Click any case for an AI-generated docket summary with links to key filings.
          </p>
        </div>

        <div style={{ ...dm, marginTop: 14, fontSize: 9, color: "#7a7a8a", textAlign: "center", lineHeight: 1.6 }}>
          Data: Lawfare Institute {"\u2022"} Documents: CourtListener RECAP {"\u2022"} Free Law Project
          {" \u2022 "}
          <button onClick={() => setShowAdmin(s => !s)}
            style={{ ...dm, fontSize: 9, color: "#8a8a9a", background: "transparent", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textDecorationColor: "#2a2a3a", textUnderlineOffset: 2 }}>
            {showAdmin ? "Close Admin" : "Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}
