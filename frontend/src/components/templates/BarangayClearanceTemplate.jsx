import GASAN_LOGO from "../../assets/gasan-logo.png";
import PHILIPPINES_LOGO from "../../assets/ph-logo.png";
import { format } from "date-fns";

export const generateClearanceTemplate = (document, officials, currentUser) => {
    // Format date for display
    const dateIssued = new Date(document.dateIssued || new Date());
    const day = dateIssued.getDate();
    const month = dateIssued.toLocaleString("default", { month: "long" });
    const year = dateIssued.getFullYear();

    // Function to get formatted official title with more compact styling
    const getFormattedOfficial = (official) => {
        const position = official.position.toLowerCase();
        const prefix = position.includes("chairman") || position.includes("kagawad") ? "HON." : "";

        return `
            <div class="text-center py-3">
                <p class="font-bold text-base">${prefix} ${official.name}</p>
                <p class="text-red-600 text-sm mt-1">${official.position}</p>
            </div>
        `;
    };

    // Sort officials by position
    const sortedOfficials = officials?.sort((a, b) => {
        const positionOrder = {
            Chairman: 1,
            "SK Chairman": 2,
            Kagawad: 3,
            Secretary: 4,
            Treasurer: 5,
        };

        // For Kagawads, sort by their number if available
        if (a.position === "Kagawad" && b.position === "Kagawad") {
            const numA = parseInt(a.name.match(/\d+/) || [0]);
            const numB = parseInt(b.name.match(/\d+/) || [0]);
            return numA - numB;
        }

        const aOrder = positionOrder[a.position] || 999;
        const bOrder = positionOrder[b.position] || 999;
        return aOrder - bOrder;
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Barangay Clearance - ${document.name}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        fontFamily: {
                            serif: ['Times New Roman', 'serif'],
                        }
                    }
                }
            };
        </script>
        <style>
            @page {
                size: letter;
                margin: 0;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                }
            }
            .border-pattern {
                border: 2px solid #000;
                position: relative;
                background: white;
            }
            .border-pattern::before {
                content: '';
                border: 2px solid #000;
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                bottom: 0.5rem;
                left: 0.5rem;
            }
        </style>
    </head>
    <body class="font-serif m-0 p-0 text-black">
        <div class="w-[8.5in] h-[11in] mx-auto p-4 bg-white shadow-lg border-pattern">
            <div class="relative z-10 h-full px-6 py-4 flex flex-col">
                <!-- Header Section -->
                <div class="flex justify-center items-center space-x-8 mb-3">
                    <img src="${PHILIPPINES_LOGO}" alt="Philippine Logo" class="w-16 h-16 object-contain">
                    <div class="text-center">
                        <p class="text-base font-semibold">Republic of the Philippines</p>
                        <p class="text-base font-semibold">Province of Marinduque</p>
                        <p class="text-base font-semibold">Municipality of Gasan</p>
                        <p class="text-xl font-bold mt-5 tracking-wider">BARANGAY ${document.barangay.toUpperCase()}</p>
                        <p class="italic text-base">OFFICE OF THE PUNONG BARANGAY</p>
                    </div>
                    <img src="${GASAN_LOGO}" alt="Gasan Logo" class="w-16 h-16 object-contain">
                </div>

                <div class="text-center mb-4">
                    <p class="text-2xl font-bold tracking-wider border-b border-t border-black py-1 px-8 inline-block">
                        BARANGAY CLEARANCE
                    </p>
                </div>

                <!-- Main Content -->
                <div class="flex gap-6 flex-1">
                    <!-- Officials List -->
                    <div class="w-[230px] h-full">
                        <div class="border border-black h-full flex flex-col">
                            <div class="text-center border-b border-black">
                                <p class="text-base font-bold py-1">BARANGAY OFFICIALS</p>
                            </div>
                            <div class="px-4 flex-1 flex flex-col justify-evenly">
                                ${sortedOfficials
                                    ?.map(
                                        (official) => `
                                        <div class="text-center">
                                            <p class="font-bold text-base">${official.position.includes("chairman") || official.position.includes("kagawad") ? "HON." : ""} ${official.name}</p>
                                            <p class="text-red-600 text-sm">${official.position}</p>
                                        </div>
                                    `
                                    )
                                    .join("")}
                            </div>
                        </div>
                    </div>

                    <!-- Clearance Content -->
                    <div class="flex-1">
                        <p class="font-bold text-base mb-4">TO ALL WHOM THESE PRESENT MAY CONCERN:</p>

                        <p class="text-justify text-base mb-4">
                            Be it known that the person whose information appears here under is a <u>bonafide</u> resident of the barangay since birth
                        </p>

                        <div class="space-y-2 mb-4">
                            <p class="text-base"><span class="font-bold">Name:</span> ${document.name}</p>
                            <p class="text-base"><span class="font-bold">Address:</span> ${document.purok} ${document.barangay}, Gasan, Marinduque</p>
                            <p class="text-base"><span class="font-bold">Date of Birth:</span> ${document.dateOfBirth}</p>
                            <p class="text-base"><span class="font-bold">Age:</span> ${document.age}</p>
                            <p class="text-base"><span class="font-bold">Sex:</span> ${document.sex}</p>
                            <p class="text-base"><span class="font-bold">Place of Birth:</span> ${document.placeOfBirth}</p>
                            <p class="text-base"><span class="font-bold">Civil Status:</span> ${document.civilStatus}</p>
                        </div>

                        <p class="text-center text-base mb-4">
                            <span class="font-bold">I HEREBY CERTIFY</span> under oath the foregoing data is true and correct
                        </p>

                        <p class="text-base mb-4">
                            <span class="font-bold">REMARKS:</span> Further certify that the subject person has a good moral character and integrity, and no derogatory record in this barangay
                        </p>

                        <p class="text-base mb-6">
                            <span class="font-bold">PURPOSE:</span> For ${document.purpose}, Issued this ${day}th day of ${month} ${year} at Barangay ${document.barangay}, Gasan, Marinduque.
                        </p>

                        <!-- Signature Line -->
                        <div class="text-center mb-4">
                            <div class="border-t border-black inline-block w-44">
                                <p class="text-sm">Signature</p>
                            </div>
                        </div>

                        <!-- Footer Section -->
                        <div class="space-y-1 mb-10">
                            <p class="text-base"><span class="font-bold">Issued at:</span> <u>${document.barangay}, Gasan, Marinduque</u></p>
                            <p class="text-base"><span class="font-bold">Issued on:</span> <u>${format(dateIssued, "MMMM dd, yyyy")}</u></p>
                            <p>OR no: <span class="underline">${document.orNumber}</span></p>
                        </div>

                        <!-- Chairman Signature -->
                        <div class="text-center">
                            <hr class="border-black w-[200px] mx-auto">
                            <p class="font-bold text-base">HON. ${officials.find(official => official.position === "Chairman")?.name}</p>
                            <p class="text-sm">Punong Barangay</p>
                        </div>
                        <p class="italic text-xs">Not valid without seal</p>
                    </div>
                </div>
            </div>
        </div>
        <script>
            window.onload = function() {
                document.title = "Barangay Clearance - ${document.name}";
                window.print();
            };
        </script>
    </body>
    </html>`;
};
