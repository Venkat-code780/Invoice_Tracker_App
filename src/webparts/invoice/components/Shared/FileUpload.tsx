import { faPaperclip, faWindowClose, faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";

function FileUpload(props: any) {
    const isMultiAllowed = props.ismultiAllowed;
    const isMandatory = props.isMandatory;
    const isnewForm = props.isnewForm;
    const fileArr = props.files?.[0] || [];
    const delefileArr = props.files?.[1] || [];
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [isFileNameOk, setFileNameOk] = useState(false);
     const isDisabled = props.disabled;

    function showFilePopup() {
        if (!isDisabled &&inputFileRef.current) {
            inputFileRef.current.click();
        }
    }

    function handleFileUpload(e: any) {
        e.preventDefault();
        setFileNameOk(false);

        const arrFiles = Array.from(e.target.files || []);
        const stateArrFiles = [...fileArr]; // clone to avoid mutation

        arrFiles.forEach((selItem: any) => {
            const filename = selItem.name;
            const baseName = filename.split(".")[0];

            if (/[^a-zA-Z0-9\-_ ()/]/.test(baseName)) {
                setFileNameOk(true);
                return;
            }

            const checkExisting = stateArrFiles.filter((file: any) => file.name === filename);
            selItem.IsNew = true;
            selItem.IsDeleted = false;

            if (checkExisting.length === 0) {
                stateArrFiles.push(selItem);
            }
        });

        props.onFileChanges([stateArrFiles, [...delefileArr]]); // clone deleted array too

        // Safely clear the input
        if (inputFileRef.current) {
            inputFileRef.current.value = "";
        }
    }

    function removeSelectedFile(fileName: any) {
        const fileCollAfterRemove = fileArr.filter((file: any) => file.name !== fileName);
        const fileArrayToRemove = fileArr.filter((file: any) => file.name === fileName && file.IsNew === false);

        const updatedDeleFileArr = [...delefileArr];
        if (fileArrayToRemove.length > 0) {
            updatedDeleFileArr.push(fileArrayToRemove[0]);
        }

        props.onFileChanges([fileCollAfterRemove, updatedDeleFileArr]);
    }

    function renderFiles() {
        const fsArr = (fileArr || []).map((file: any, index: number) => {
            const fileName = file.name;
            const fileUrl = file.URL;

            return (
                <li className="hoverclass col-md-3" key={index}>
                    {fileUrl ? (
                        <a target="_blank" download href={fileUrl}>
                            <FontAwesomeIcon icon={faPaperclip} /> <span>{fileName}</span>
                        </a>
                        
                   
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faPaperclip} /> <span>{fileName}</span>
                        </>
                    )}
                    {!isDisabled && isnewForm && (
                    <span className="ms-2 close-attachment" hidden={!isnewForm}>
                        <FontAwesomeIcon onClick={() => removeSelectedFile(fileName)} icon={faWindowClose} />
                    </span>
                    )}
                </li>
        
            

            );
        });

        return fsArr;
    }

    return (
        <div>
            <h6 className="my-2">Attachment {isMandatory && <span className="mandatoryhastrick">*</span>}</h6>
            <div>
                <div>
                    <button type="button" onClick={showFilePopup} className="btn upload-btn">
                        Choose File <FontAwesomeIcon icon={faCloudUploadAlt} />
                    </button>
                    <input
                        multiple={isMultiAllowed}
                        ref={inputFileRef}
                        type="file"
                        onChange={handleFileUpload}
                        title="Please choose file"
                        style={{ display: "none" }}
                        className="inputFile"
                        disabled={isDisabled}
                    />
                </div>
                <div>
                    <ul className="attachment-list row px-3 mt-1">{renderFiles()}</ul>
                    {isFileNameOk && (
                        <span style={{ color: "red" }}>
                            Special characters are not allowed in uploaded File
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FileUpload;
