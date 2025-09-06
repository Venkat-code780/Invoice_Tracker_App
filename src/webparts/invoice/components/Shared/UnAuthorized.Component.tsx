import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPaper } from "@fortawesome/free-solid-svg-icons";

export interface UnAuthorizedProps {
    spContext: any;
}

export interface UnAuthorizedState {

}

class UnAuthorized extends React.Component<UnAuthorizedProps, UnAuthorizedState> {
    private siteURL: string;

    constructor(props: UnAuthorizedProps) {
        super(props);
        this.siteURL = props.spContext.webAbsoluteUrl;
    }

    public componentDidMount(): void {
        const sideNav: any = document.getElementsByClassName("sidebar");
        if (sideNav && sideNav.length > 0) {
            sideNav[0].style.display = "none";
        }

        const navIcon = document.querySelector('.click-nav-icon') as HTMLElement;
        if (navIcon) {
            navIcon.style.display = 'none';
        }
    }

    public render() {
        return (
            <div className="outer-Unauthorized">
                <div className="inner-Unauthorized">
                    <div className="row align-items-center">
                        <div className="col-md-4 text-right">
                            <div className="hand">
                                <FontAwesomeIcon icon={faHandPaper} />
                            </div>
                        </div>
                        <div className="col-md-8">
                            <h2 style={{ color: '#df5556' }}>Access Denied</h2>
                            <p style={{ fontSize: "21px" }}>You don't have Access to this Page.</p>
                            <p><a href={this.siteURL}>Click Here</a> to navigate to Invoice Tracker</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default UnAuthorized;