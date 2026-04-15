
import toast from "react-hot-toast";

export function ToastPersonalizado(props: { message: string, type?: string }) {

    if (props.type == "erro") {
        toast(props.message, {
            style: {
                borderRadius: '10px',
                // border: '2px solid #FF0000',
                background: '#b71010',
                color: '#FFFFFF',
                fontSize: '16px',
            },
        })
    } else if (props.type == "sucesso") {
        toast(props.message, {
            style: {
                borderRadius: '10px',
                background: '#71c540',
                color: '#FFFFFF',
                fontSize: '16px',
            },
        })
    } else {
        toast(props.message, {
            style: {
                borderRadius: '10px',
                background: '#1B6F96',
                color: '#FFFFFF',
                fontSize: '16px',
            },
        })
    }
}