import React, { useEffect, useRef, useState } from "react";
import Handsontable from "handsontable";
import { HyperFormula } from 'hyperformula';
import { HotTable, HotColumn } from "@handsontable/react";
import "handsontable/dist/handsontable.min.css";
import "./App.css";

// usertype / which section should be displayed
const userGroup = {
  "Admin: M&A Team": [
    "Employee Unique ID (Primary Key)",
    "Core People Data",
    "M&A Integration Proces",
    "Legal",
    "Immigration",
    "Mobility",
    "EIB (onboard into WD)",
    "Comp (M&A)",
    "Welcome / POps",
    "Separation / POps",
    "HR",
    "Cell Formula Demo"
  ],
  "Legal Team": ["Employee Unique ID (Primary Key)", "Core People Data", "Legal", "Immigration", "Comp (M&A)"],
  "Welcome Team": ["Employee Unique ID (Primary Key)", "Core People Data", "Welcome / POps"],
  "Separation Team": ["Employee Unique ID (Primary Key)", "Core People Data", "Separation / POps"]
}

const mockSectionData = {
  "Employee Unique ID (Primary Key)": 'Employee Unique ID',
  "Core People Data": 'First Name	Last Name	Email	Company	Legal Entity	Employee Status	Employee Type	Date of Hire	Immigration Supported	Office/\nLocation	Remote working	Current Job Level	Current Job Title	Current Job Family Group	Function',
  'M&A Integration Proces': 'Uber EEID	In Deal (Y/N)	WAVE	Disposition	Cohort	Reason left Deal	Date Left',
  'Legal': 'Gender	Date of Birth	Race/Ethnicity	Nationality	Supervisor Unique ID	Supervisor Organization	Supervisor Email	AIA Flag	Legal Hold	Garden Leave	Employee Transfer Decision	Talent Release Justification	Notification Date	Last Day Worked	Termination Date	Office location	Disposition',
  'Immigration': 'Immigration Supported	Immigration Status	Visa Expiration	Can start on Day 1?	Eligible for Immi Garden Leave',
  'Mobility': 'On Assignment (Y/N)	Assignment end date	Relocation (Y/N)',
  'EIB (onboard into WD)': `Employee ID	Manager's Employee ID	Supervisory Organization Reference ID	Position ID	Job Posting Title	Availability Date	Earliest Hire Date	Country (Alpha-3 Code)	Prefix	Legal First Name	Legal Middle Name	Legal Last Name	Suffix	Personal Email Address	Hire Reason Code	Hire Date	Original Hire Date	Employee Type	Continuous Service Date	Conversion Position Start Date	Job Profile (Job Code)	Position Title	Business Title	Location	Location ID	Time Type	Work Shift	Default Hours	Scheduled Hours	FTE Validation	Pay Rate Type	Compensation Package	Compensation Grade	Compensation Grade ID	Compensation Grade Profile	Compensation Grade Profile ID	Base Pay Plan	Base Pay Amount	Base Pay Currency	Base Pay Frequency	Allowance Plan 1	Allowance Plan 1 Reference ID	Allowance 1 Amount	Allowance 1 Frequency	Bonus Plan	Bonus Plan ID	Bonus Plan Amount	Bonus Plan Percent	Period Salary Plan	Period Salary Plan ID	Commission Plan	Commission Plan ID	Commission Plan Target Amount	Draw Amount	Draw Frequency	Draw Duration	Recoverable?	Company	Company ID	Cost Center	Cost Center ID	Market	Market ID	Line of Business	Line of Business ID	Pay Group	Pay Group ID	Work Email/User Name	Contract Start Date	Contract End Date	Contract Status	Position Reference	Address Line 1	Address Line 2	Address Line 3	Address Line 4	City	State/Region	Postal Code	Country	Use For	One-Time Payment Plan	Effective Date	Scheduled Payment Date	Amount	Currency	Send to Payroll?`,
  'Comp (M&A)': `Job Profile	Job Family	Job Level	Pay Rate Type`,
  'Welcome / POps': `Email Address	Name	Personal Email	EEID	Job Title	Manager	Uber Office Location	Base Salary	Bonus Target	New Hire Grant	Bridge Bonus	Retention Bonus`,
  'Separation / POps': `Email Address	Name	Personal Email	EEID	Disposition	Original Start Date	"Tenured Uber 
  (Years + Quarters)"	Current Unvested Equity	Weekly Salary	2 weeks pay	"Base Severance
  ( 4 weeks) "	Tenure Severance	"Uber Severance
  ( Base + Tenure)"	Uber Severance less Equity	Is equity greater than Uber severance? (greater/ Less)	Final Severance amount	COBRA amount	6 Month Benefits Cash Payment	LOA Flag?	Immigration Check	Severance template	Hourly Rate	Hours per Week	Integration Bonus	Location	CA or Non CA	Date of Birth	Age	Job Title	Uber Severance Policy	WARN check`,
  'HR': `Supervisory Org	ELT	ELT+1`,
  "Cell Formula Demo": 'First Value	Second Value	Operation	Output'
}

let allSections = []
let nestedHeaders = [[], []];
let allColumns = []
const generateNestedHeaders = (rawData) => {
  let columnIndex = 0;
  Object.entries(rawData).forEach(([key, value], index) => {
    allSections.push(key);

    let tempSplitArr = value.split('\t');
    nestedHeaders[0].push({
      label: key,
      colspan: tempSplitArr.length,
    });
    nestedHeaders[1] = nestedHeaders[1].concat(tempSplitArr);

    tempSplitArr.forEach((col, tempI) => {
      allColumns.push([
        col,
        key,
        (key === 'Employee Unique ID (Primary Key)' || key === 'Core People Data' || (key === "Legal" && tempI < 5)) ? true : false,
        columnIndex
      ]);
      columnIndex += 1;
    });
  });
  return;
};
generateNestedHeaders(mockSectionData);

const mockRawData = [[
  'ABC_100000	John	Smith	jsmith@abc.com	ABC	ABC US Ltd	Active	Employee 	01/01/2010	Y	Dallas, TX	Yes	6	Data Analyst	Analysts	Support',
  'ABC_100000	Y	2				',
  'Male	01/01/1970	White	American	1234	Analytics	pburke@abc.com	Result of AIA analysis		No							',
  'Y	L-1A	11/2/2022	Y	Y',
  'Y	12/2022	Y',
  '545454	ABC_100000	WFM Team - Krakow (Manas Kapoor)	65652	Engineer	11/1/2021	11/1/2021	USA	Mr	John	William	Johnson		williams@gmail.com	98	11/1/2021	11/1/2021	IC	11/1/2021	11/1/2021	65	Engineer	Engineer	San Francisco	112	Full Time	bi weekly	40	40	40	Full Time	240000	6	654	345	435	5000	11000	USD	bi weekly	A 																																														',
  'Operations Engineer	Engineering	Level 4	Salary',
  'jma@uber.com	Jim James	jim@gmail.com	233442	Engineer	Jack Edwars	San Francisco	150000	35000	250000	120000	12000',
  'jma@uber.com	Jim Jones	jim@gmail.com	233442	2B	9/9/2018	2	100000	3000	6000	11200	5000	16200	Y	Less	20100	4000	12000	NA	Y	Sent	24	40	2300	San Francisco	CA   	11/7/1982	39	Engineer II		NA',
  'WFM Team - Krakow (Manas Kapoor)	Jill Hazelbaker	Thomas Ranese',
  '10', '26', 'Sum', '=SUM(GD1:GE1)'
], [
  'XYZ_100000	Raj	Patel	raj.patel@xyz.com	XYZ	XYZ Canada Sub	Active	Contractor	12/01/2002	Y	Quebec, Canada	Yes	4	Data Engineer	Engineering	Support',
  'XYZ_100000	Y	2				',
  'Male	08/25/1980	Asian	Indian	456788	Engineering	tim.copling@xyz.com			No			09/01/2021	10/01/2021	10/01/2021		',
  'N	H-1B	1/21/2013	N 	NA',
  'N	NA	N',
  '678345	XYZ_100000	Eats Support (Katarzyna Barbara Musiał)	9781	Sales Lead	10/15/2021	10/15/2021	CDA	Mrs	Lisa	Maria	Jones		Jones@gmail.com	121	10/15/2021	10/15/2021	Mgr	10/15/2021	10/15/2021	34	Sales Lead	Global Sales Lead	San Francisco	112	Full Time	bi weekly	40	40	40	Full Time	400000	6	654	345	435	5000	11000	USD	bi weekly	A 																																														',
  'Software Engineer	Engineering	Level 5	Salary',
  'joan@uber.com	Joan Davis	jd1232@gmail.com	453222	Sales Manager	Jill Beans	San Francisco	150000	45000	250000	10000	12000',
  'joan@uber.com	Joan Williams	jd1232@gmail.com	453222	1A	10/1/2020	1	210000	2300	2600	11000	3000	14000	N	Greater	17800	4000	12000	NA	Y	Sent	32	40	2300	Chicago	Non CA	6/6/1988	33	Sales Manager		NA',
  'Eats Support (Katarzyna Barbara Musiał)	Andrew Macdonald	Anabel Diaz',
  '10', '26', 'Average', '=AVERAGE(GD2:GE2)'
], [
  'ABC_100001	John2	Smith2	jsmith@abc.com	ABC	ABC US Ltd	Active	Employee 	01/01/2010	Y	Dallas, TX	Yes	6	Data Analyst	Analysts	Support',
  'ABC_100000	Y	2				',
  'Female	01/01/1970	White	American	1234	Analytics	pburke@abc.com	Result of AIA analysis		No							',
  'Y	L-1A	11/2/2022	Y	Y',
  'Y	12/2022	Y',
  '545454	ABC_100000	WFM Team - Krakow (Manas Kapoor)	65652	Engineer	11/1/2021	11/1/2021	USA	Mr	John	William	Johnson		williams@gmail.com	98	11/1/2021	11/1/2021	IC	11/1/2021	11/1/2021	65	Engineer	Engineer	San Francisco	112	Full Time	bi weekly	40	40	40	Full Time	240000	6	654	345	435	5000	11000	USD	bi weekly	A 																																														',
  'Operations Engineer	Engineering	Level 4	Salary',
  'jma@uber.com	Jim James	jim@gmail.com	233442	Engineer	Jack Edwars	San Francisco	150000	35000	250000	120000	12000',
  'jma@uber.com	Jim Jones	jim@gmail.com	233442	2B	9/9/2018	2	100000	3000	6000	11200	5000	16200	Y	Less	20100	4000	12000	NA	Y	Sent	24	40	2300	San Francisco	CA   	11/7/1982	39	Engineer II		NA',
  'WFM Team - Krakow (Manas Kapoor)	Jill Hazelbaker	Thomas Ranese',
  '10', '26', 'Median', '=MEDIAN(GD3:GE3)'
], [
  'XYZ_100001	Raj2	Patel2	raj.patel@xyz.com	XYZ	XYZ Canada Sub	Active	Contractor	12/01/2002	Y	Quebec, Canada	Yes	4	Data Engineer	Engineering	Support',
  'XYZ_100000	Y	2				',
  'Female	08/25/1980	Asian	Indian	456788	Engineering	tim.copling@xyz.com			No			09/01/2021	10/01/2021	10/01/2021		',
  'N	H-1B	1/21/2013	N 	NA',
  'N	NA	N',
  '678345	XYZ_100000	Eats Support (Katarzyna Barbara Musiał)	9781	Sales Lead	10/15/2021	10/15/2021	CDA	Mrs	Lisa	Maria	Jones		Jones@gmail.com	121	10/15/2021	10/15/2021	Mgr	10/15/2021	10/15/2021	34	Sales Lead	Global Sales Lead	San Francisco	112	Full Time	bi weekly	40	40	40	Full Time	400000	6	654	345	435	5000	11000	USD	bi weekly	A 																																														',
  'Software Engineer	Engineering	Level 5	Salary',
  'joan@uber.com	Joan Davis	jd1232@gmail.com	453222	Sales Manager	Jill Beans	San Francisco	150000	45000	250000	10000	12000',
  'joan@uber.com	Joan Williams	jd1232@gmail.com	453222	1A	10/1/2020	1	210000	2300	2600	11000	3000	14000	N	Greater	17800	4000	12000	NA	Y	Sent	32	40	2300	Chicago	Non CA	6/6/1988	33	Sales Manager		NA',
  'Eats Support (Katarzyna Barbara Musiał)	Andrew Macdonald	Anabel Diaz',
  '10', '26', 'MAX', '=MAX(GD4:GE4)'
], [
  'ABC_100002	John3	Smith3	jsmith@abc.com	ABC	ABC US Ltd	Active	Employee 	01/01/2010	Y	Dallas, TX	Yes	6	Data Analyst	Analysts	Support',
  'ABC_100000	Y	2				',
  'Male	01/01/1970	White	American	1234	Analytics	pburke@abc.com	Result of AIA analysis		No							',
  'Y	L-1A	11/2/2022	Y	Y',
  'Y	12/2022	Y',
  '545454	ABC_100000	WFM Team - Krakow (Manas Kapoor)	65652	Engineer	11/1/2021	11/1/2021	USA	Mr	John	William	Johnson		williams@gmail.com	98	11/1/2021	11/1/2021	IC	11/1/2021	11/1/2021	65	Engineer	Engineer	San Francisco	112	Full Time	bi weekly	40	40	40	Full Time	240000	6	654	345	435	5000	11000	USD	bi weekly	A 																																														',
  'Operations Engineer	Engineering	Level 4	Salary',
  'jma@uber.com	Jim James	jim@gmail.com	233442	Engineer	Jack Edwars	San Francisco	150000	35000	250000	120000	12000',
  'jma@uber.com	Jim Jones	jim@gmail.com	233442	2B	9/9/2018	2	100000	3000	6000	11200	5000	16200	Y	Less	20100	4000	12000	NA	Y	Sent	24	40	2300	San Francisco	CA   	11/7/1982	39	Engineer II		NA',
  'WFM Team - Krakow (Manas Kapoor)	Jill Hazelbaker	Thomas Ranese',
  '10', '26', 'MIN', '=MIN(GD5:GE5)'
], [
  'XYZ_100002	Raj3	Patel3	raj.patel@xyz.com	XYZ	XYZ Canada Sub	Active	Contractor	12/01/2002	Y	Quebec, Canada	Yes	4	Data Engineer	Engineering	Support',
  'XYZ_100000	Y	2				',
  'Female	08/25/1980	Asian	Indian	456788	Engineering	tim.copling@xyz.com			No			09/01/2021	10/01/2021	10/01/2021		',
  'N	H-1B	1/21/2013	N 	NA',
  'N	NA	N',
  '678345	XYZ_100000	Eats Support (Katarzyna Barbara Musiał)	9781	Sales Lead	10/15/2021	10/15/2021	CDA	Mrs	Lisa	Maria	Jones		Jones@gmail.com	121	10/15/2021	10/15/2021	Mgr	10/15/2021	10/15/2021	34	Sales Lead	Global Sales Lead	San Francisco	112	Full Time	bi weekly	40	40	40	Full Time	400000	6	654	345	435	5000	11000	USD	bi weekly	A 																																														',
  'Software Engineer	Engineering	Level 5	Salary',
  'joan@uber.com	Joan Davis	jd1232@gmail.com	453222	Sales Manager	Jill Beans	San Francisco	150000	45000	250000	10000	12000',
  'joan@uber.com	Joan Williams	jd1232@gmail.com	453222	1A	10/1/2020	1	210000	2300	2600	11000	3000	14000	N	Greater	17800	4000	12000	NA	Y	Sent	32	40	2300	Chicago	Non CA	6/6/1988	33	Sales Manager		NA',
  'Eats Support (Katarzyna Barbara Musiał)	Andrew Macdonald	Anabel Diaz',
  '10', '26', 'Sum of First Value', '=SUM(GD:GD)'
]
]

const cleanRawData = (rawDataArr) => {
  let cleanedData = [];
  rawDataArr.forEach((rawData) => {
    cleanedData.push(rawData.reduce((prev, data) => {
      return prev.concat(data.split('\t'));
    }, []))
  });
  return cleanedData;
};
const cleanData = cleanRawData(mockRawData);

function App() {

  const hotTable = useRef();
  const [activeUser, setActiveUser] = useState('Admin: M&A Team');
  const [activeSection, setActiveSection] = useState("Core People Data");
  const [tableHasChanged, setTableHasChanged] = useState(false);

  useEffect(() => {
    if (hotTable.current) {
      // collapse all titles
      // hotTable.current.hotInstance.getPlugin("collapsibleColumns").collapseAll();

      // get the column index that should be hidden
      let tempHiddenArray = [];
      allColumns.forEach(([columnName, sectionName, readOnlyIndicator, colIndex], index) => {
        if (sectionName === activeSection || sectionName === 'Employee Unique ID (Primary Key)') {
          return;
        }
        tempHiddenArray.push(index);
      });
      // hide the column
      hotTable.current.hotInstance.getPlugin("hiddenColumns").hideColumns(tempHiddenArray);
      hotTable.current.hotInstance.render();
    }
  });

  const testAfterChange = (changes) => {
    if (!changes) return;
    let [row, col, preValue, afterValue] = changes[0];
    if (preValue === afterValue) return;
    alert(`value at row: ${row}, col: ${col} has changed from ${preValue} to ${afterValue}`);
    if (!tableHasChanged) setTableHasChanged(true);
  }

  const changeUser = (userType) => {
    // change active user
    setActiveUser(userType);
    // set default column
    (userType === 'Admin: M&A Team') ? setActiveSection(userGroup[userType][1]) : setActiveSection(userGroup[userType][2]);
  };

  const changeSection = (currentActiveSection) => {
    // set active section
    setActiveSection(currentActiveSection);
  };

  const customValidator = (columnName, colIndex, query, callback) => {
    console.log(query);
    if (columnName === "Gender" && (query.toLowerCase() !== "male" && query.toLowerCase() !== "female")) {
      callback(false);
    } else {
      callback(true);
    }
  }

  return (
    <div className="app-container">

      <h2 className="app-title">M&A Data Demo</h2>

      <div className="user-role-group">
        <p>Personas / User roles</p>
        {
          Object.keys(userGroup).map((key) => {
            return <div className={`app-button ${key === activeUser ? "active" : ""}`} key={key} onClick={() => changeUser(key)}>{key}</div>;
          })
        }
        <p className="current-user">Current User Role is {activeUser}</p>
      </div>

      <div className="table-column-group">
        <p>This user can view below sections; Click below buttons to view different section table</p>
        {
          userGroup[activeUser].map((key, index) => {
            return <div className={`app-button ${index === 0 ? "unclickable active" : ""} ${key === activeSection ? "active" : ""}`} key={`section-title-${key}`} onClick={() => changeSection(key)}>{key}</div>;
          })
        }
      </div>

      <HotTable
        id="app-table"
        ref={hotTable}
        data={cleanData}
        height={'auto'}
        width={"100%"}
        colWidths={250}
        search={true}
        nestedHeaders={nestedHeaders}
        collapsibleColumns={true}
        dropdownMenu={true}
        multiColumnSorting={true}
        filters={true}
        rowHeaders={true}
        // colHeaders={true}
        fixedColumnsLeft={1}
        manualColumnResize={true}
        manualRowResize={true}
        manualRowMove={true}
        hiddenColumns={true}
        formulas={{
          engine: HyperFormula,
        }}
        // afterChange={(changes) => testAfterChange(changes)}
        licenseKey="non-commercial-and-evaluation">

        {
          allColumns.map(([columnName, sectionName, readOnlyIndicator, colIndex]) => {
            return <HotColumn
              key={`hotColumn-${colIndex}`}
              data={colIndex}
              readOnly={activeUser !== 'Admin: M&A Team' && readOnlyIndicator}
              validator={(query, callback) => { customValidator(columnName, colIndex, query, callback) }}
            />
          })
        }

      </HotTable>

      <p>Features need to implement in the future</p>
      <div className={`app-button ${tableHasChanged ? "active" : ""}`}>Save the new / updated fields</div>
      <div className="app-button">Import from Google Sheet</div>
      <div className="app-button">Export to Google Sheet</div>
      {/* <div className="app-button">Download Data to Local</div> */}

    </div>
  );
}

export default App;
