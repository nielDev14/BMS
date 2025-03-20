import GASAN_LOGO from "../../assets/gasan-logo.png";
import PHILIPPINES_LOGO from "../../assets/ph-logo.png";

export const generateIndigencyTemplate = (document, officials, currentUser) => {
    // Get the chairman's name from officials
    const chairmanName = officials.find(official => official.position === "Chairman")?.name || "[BARANGAY CAPTAIN NAME]";

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Indigency - ${document.name}</title>
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
                border-radius: 5px;
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
                border-radius: 3px;
            }
        </style>
    </head>
    <body class="font-serif m-0 p-0 text-black flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-[8.5in] h-[11in] mx-auto p-8 bg-white shadow-lg border-pattern">
            <div class="relative z-10 h-full px-12 py-8 flex flex-col items-center">
                <!-- Header Section -->
                <div class="flex justify-center items-center space-x-12 mb-6">
                    <img src="${PHILIPPINES_LOGO}" 
                         alt="Philippine Logo" 
                         class="w-28 h-28 object-contain"
                    >
                    <div class="text-center space-y-1">
                        <p class="text-base font-semibold">Republic of the Philippines</p>
                        <p class="text-base font-semibold">Province of Marinduque</p>
                        <p class="text-base font-semibold">Municipality of Gasan</p>
                    </div>
                    <img src="${GASAN_LOGO}" 
                         alt="Gasan Logo" 
                         class="w-28 h-28 object-contain"
                    >
                </div>

                <!-- Title Section -->
                <div class="space-y-2 mb-12 mt-8">
                    <div class="text-center">
                        <p class="text-2xl font-bold tracking-wide uppercase">BARANGAY ${document.barangay.toUpperCase()}</p>
                    </div>
                    <div class="text-center">
                        <p class="italic text-lg uppercase">OFFICE OF THE PUNONG BARANGAY</p>
                    </div>
                    <div class="text-center mt-8">
                        <p class="text-3xl font-bold tracking-wider border-b-2 border-t-2 border-black py-2 px-8 inline-block uppercase">
                            CERTIFICATE OF INDIGENCY
                        </p>
                    </div>
                </div>

                <!-- Main Content Container -->
                <div class="flex-1 w-full max-w-3xl mt-8">
                    <div class="space-y-8">
                        <p class="text-left font-semibold text-lg uppercase">TO WHOM IT MAY CONCERN:</p>

                        <p class="text-justify leading-relaxed text-base">
                            This is to certify that, <span class="font-bold underline">${document.name}</span>, 
                            <span class="font-bold underline">${document.age}</span> years old, Single and Resident of 
                            Barangay ${document.barangay}, Gasan, Marinduque belongs to an indigent family.
                        </p>

                        <p class="text-justify leading-relaxed text-base">
                            This further certifies that he/she is eligible for 
                            <span class="font-bold italic">${document.purpose}</span> application/assistance.
                        </p>

                        <p class="text-justify leading-relaxed text-base">
                            Issued this ${new Date(document.dateIssued || new Date()).getDate()}th day of 
                            ${new Date(document.dateIssued || new Date()).toLocaleString("default", { month: "long" })}, 
                            ${new Date(document.dateIssued || new Date()).getFullYear()} 
                            at Barangay ${document.barangay}, Gasan, Marinduque.
                        </p>
                    </div>
                </div>

                <!-- Signature Section -->
                <div class="text-center w-full mt-auto pt-12">
                    <div class="inline-block border-t-2 border-black pt-2 px-16">
                        <p class="font-bold uppercase mb-1 text-lg">${chairmanName}</p>
                        <p class="uppercase text-sm">Punong Barangay</p>
                    </div>
                </div>
            </div>
        </div>
        <script>
            window.onload = function() {
                window.print();
            };
        </script>
    </body>
    </html>`;
};
